const pool = require("../db");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;
        const city = req.query.city;
        const zipcode = req.query.zipcode;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const beds = req.query.beds;
        const baths = req.query.baths;

        const conditions = [];
        const values = [];

        if (city) {
            conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
            values.push(city);
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

        if (maxPrice != undefined && (!Number.isFinite(Number(maxPrice)) || Number(maxPrice < 0))) {
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

        const [countRows] = await pool.query(
            `SELECT COUNT(*) AS total FROM rets_property ${whereClause}`,
            values
        );

        const [rows] = await pool.query(
        `SELECT * FROM rets_property ${whereClause} ORDER BY id LIMIT ? OFFSET ?`,
        [...values, limit, offset]
        );

        

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

module.exports = router;