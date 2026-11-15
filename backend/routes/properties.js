const pool = require("../db");
const express = require("express");
const router = express.Router();

// Whitelist of real rets_property columns that may be used in ORDER BY.
// SQL identifiers can't be bound with "?", so only values from this list
// are ever interpolated into the query string.
const SORTABLE_COLUMNS = Object.freeze({
    L_SystemPrice: "L_SystemPrice",            // price
    ListingContractDate: "ListingContractDate", // date listed
    LM_Int2_3: "LM_Int2_3",                    // square footage
    L_Keyword2: "L_Keyword2"                   // bedrooms
});

const SORT_ORDERS = Object.freeze({ asc: "ASC", desc: "DESC" });

// Returns { orderBy } on success or { error } for an invalid request.
// `alias` qualifies column names (e.g. "p.") when the query joins tables.
function buildOrderBy(sortBy, sortOrder, alias = "") {
    if (sortOrder !== undefined) {
        if (typeof sortOrder !== "string" ||
            !Object.hasOwn(SORT_ORDERS, sortOrder.toLowerCase())) {
            return { error: "sortOrder must be 'asc' or 'desc'" };
        }
    }

    if (sortBy === undefined) {
        return { orderBy: "ORDER BY id" };
    }

    if (typeof sortBy !== "string" || !Object.hasOwn(SORTABLE_COLUMNS, sortBy)) {
        return {
            error: `sortBy must be one of: ${Object.keys(SORTABLE_COLUMNS).join(", ")}`
        };
    }

    const column = alias + SORTABLE_COLUMNS[sortBy];
    const direction = SORT_ORDERS[(sortOrder || "asc").toLowerCase()];

    // "column IS NULL" first keeps listings with missing data at the end in
    // both directions; "id" breaks ties so pages never overlap or skip rows.
    return { orderBy: `ORDER BY ${column} IS NULL, ${column} ${direction}, ${alias}id ${direction}` };
}

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
        const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
        const city = req.query.city;
        const zipcode = req.query.zipcode;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const beds = req.query.beds;
        const baths = req.query.baths;

        const conditions = [];
        const values = [];

        if (city) {
            conditions.push("L_City = ?");
            values.push(city.trim());
        }

        if (zipcode) {
            conditions.push("L_Zip = ?");
            values.push(zipcode);
        }

        if (minPrice) {
            conditions.push("L_SystemPrice >= ?");
            values.push(minPrice);
        }

        if (maxPrice) {
            conditions.push("L_SystemPrice <= ?");
            values.push(maxPrice);
        }

        if (beds) {
            conditions.push("L_Keyword2 = ?");
            values.push(beds);
        }

        if (baths) {
            conditions.push("LM_Dec_3 = ?");
            values.push(baths);
        }

        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        if (limit < 1 || limit > 100 || !Number.isInteger(limit)) {
            return res.status(400).json({
            error: "limit must be an integer between 1 and 100"
        });
        }

        if (offset < 0 || !Number.isInteger(offset)) {
            return res.status(400).json({
            error: "offset must be a non-negative integer"
            });
        }

        if (minPrice != undefined && (!Number.isFinite(Number(minPrice)) || Number(minPrice) < 0)) {
            return res.status(400).json({
                error: "minPrice must be a non-negative number"
            })
        }

        if (maxPrice != undefined && (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) < 0)) {
            return res.status(400).json({
                error: "maxPrice must be a non-negative number"
            })
        }

        if (beds !== undefined && (!Number.isInteger(Number(beds)) || Number(beds) < 0)) {
            return res.status(400).json({
            error: "beds must be a non-negative integer"
            });
        }

        if (baths !== undefined && (!Number.isFinite(Number(baths)) || Number(baths) < 0)) {
            return res.status(400).json({
            error: "baths must be a non-negative integer"
            });
        }

        const { orderBy, error: sortError } = buildOrderBy(
            req.query.sortBy,
            req.query.sortOrder
        );

        if (sortError) {
            return res.status(400).json({ error: sortError });
        }

        const [countRows] = await pool.query(
            `SELECT COUNT(*) AS total FROM rets_property ${whereClause}`,
            values
        );

        let rows;

        if (req.query.sortBy === undefined) {
            // Default order uses the primary key, so this is already fast.
            [rows] = await pool.query(
                `SELECT * FROM rets_property ${whereClause} ${orderBy} LIMIT ? OFFSET ?`,
                [...values, limit, offset]
            );
        } else {
            // Deferred join: sorting full rows (big text/photo columns) across
            // the whole table is slow, so sort only ids in the subquery, then
            // fetch full rows for just this page and re-apply the same order.
            const { orderBy: outerOrderBy } = buildOrderBy(
                req.query.sortBy,
                req.query.sortOrder,
                "p."
            );

            [rows] = await pool.query(
                `SELECT p.* FROM rets_property p
                 JOIN (
                     SELECT id FROM rets_property ${whereClause} ${orderBy} LIMIT ? OFFSET ?
                 ) page ON page.id = p.id
                 ${outerOrderBy}`,
                [...values, limit, offset]
            );
        }

        res.json({
            total: countRows[0].total,
            limit,
            offset,
            results: rows
        });
    } catch (error) {
        console.error("Failed to fetch properties:", error);

        res.status(500).json({
            error: "Failed to fetch properties"
        });
    }
});

router.get("/:id/openhouses", async (req, res) => {
    try {
        const id = req.params.id;

        if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) {
            return res.status(400).json({
                error: "Property ID must be a valid positive integer"
            });
        }

        const [properties] = await pool.query(
            "SELECT L_ListingID FROM rets_property WHERE id = ?",
            [id]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                error: `Property with ID ${id} was not found`
            });
        }

        const listingId = properties[0].L_ListingID;

        if (!listingId) {
            return res.json([]);
        }

        const [openhouses] = await pool.query(
            `SELECT *
             FROM rets_openhouse
             WHERE L_ListingID = ?
             ORDER BY OpenHouseDate ASC, OH_StartTime ASC`,
            [listingId]
        );

        res.json(openhouses);
    } catch (error) {
        console.error("Failed to fetch open houses:", error);

        res.status(500).json({
            error: "Failed to fetch open houses"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) {
            return res.status(400).json({
                error: "Property ID must be a valid positive integer"
            });
        }

        const [rows] = await pool.query(
            "SELECT * FROM rets_property WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: `Property with ID ${id} was not found`
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Failed to fetch property:", error);

        res.status(500).json({
            error: "Failed to fetch property"
        });
    }
});
module.exports = router;
module.exports.buildOrderBy = buildOrderBy;
module.exports.SORTABLE_COLUMNS = SORTABLE_COLUMNS;