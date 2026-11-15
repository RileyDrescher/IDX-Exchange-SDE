// Sorting tests for GET /api/properties.
// The MySQL pool is mocked, so these run without Docker and let us
// inspect the exact SQL and bound values the route sends.
jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const pool = require("../db");
const app = require("../server");
const { buildOrderBy } = require("../routes/properties");

function mockResults(rows = []) {
    pool.query
        .mockResolvedValueOnce([[{ total: rows.length }]]) // COUNT(*)
        .mockResolvedValueOnce([rows]);                    // SELECT *
}

function selectSql() {
    // Second call is the SELECT ... ORDER BY ... LIMIT query
    return pool.query.mock.calls[1][0];
}

beforeEach(() => {
    pool.query.mockReset();
    jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
    console.log.mockRestore();
});

describe("buildOrderBy", () => {
    test("defaults to ORDER BY id when no sort is given", () => {
        expect(buildOrderBy(undefined, undefined)).toEqual({ orderBy: "ORDER BY id" });
    });

    test("builds NULLS-last order with id tie-breaker", () => {
        expect(buildOrderBy("L_SystemPrice", "desc").orderBy).toBe(
            "ORDER BY L_SystemPrice IS NULL, L_SystemPrice DESC, id DESC"
        );
    });

    test("qualifies columns with a table alias", () => {
        expect(buildOrderBy("L_SystemPrice", "asc", "p.").orderBy).toBe(
            "ORDER BY p.L_SystemPrice IS NULL, p.L_SystemPrice ASC, p.id ASC"
        );
    });

    test("sortOrder is case-insensitive and defaults to asc", () => {
        expect(buildOrderBy("LM_Int2_3", "ASC").orderBy).toContain("LM_Int2_3 ASC");
        expect(buildOrderBy("LM_Int2_3", undefined).orderBy).toContain("LM_Int2_3 ASC");
    });
});

describe("GET /api/properties sorting", () => {
    test("price low-to-high", async () => {
        mockResults([{ id: 2, L_SystemPrice: 100 }, { id: 1, L_SystemPrice: 200 }]);

        const res = await request(app)
            .get("/api/properties?sortBy=L_SystemPrice&sortOrder=asc");

        expect(res.status).toBe(200);
        expect(selectSql()).toContain("ORDER BY L_SystemPrice IS NULL, L_SystemPrice ASC, id ASC");
    });

    test("price high-to-low", async () => {
        mockResults();
        const res = await request(app)
            .get("/api/properties?sortBy=L_SystemPrice&sortOrder=desc");

        expect(res.status).toBe(200);
        expect(selectSql()).toContain("L_SystemPrice DESC");
    });

    test.each([
        ["ListingContractDate"],
        ["LM_Int2_3"],
        ["L_Keyword2"]
    ])("sorts by %s", async (column) => {
        mockResults();
        const res = await request(app).get(`/api/properties?sortBy=${column}&sortOrder=desc`);

        expect(res.status).toBe(200);
        expect(selectSql()).toContain(`ORDER BY ${column} IS NULL, ${column} DESC`);
    });

    test("sorting combines with filters and pagination", async () => {
        mockResults();
        const res = await request(app).get(
            "/api/properties?city=Lathrop&minPrice=100000&sortBy=L_SystemPrice&sortOrder=asc&limit=20&offset=40"
        );

        expect(res.status).toBe(200);
        const [sql, values] = pool.query.mock.calls[1];
        expect(sql).toMatch(/WHERE L_City = \? AND L_SystemPrice >= \? ORDER BY L_SystemPrice/);
        expect(values).toEqual(["Lathrop", "100000", 20, 40]);
        // COUNT query must not carry ORDER BY / LIMIT
        expect(pool.query.mock.calls[0][0]).not.toContain("ORDER BY");
    });

    test("sorted queries sort ids in a subquery, then join full rows", async () => {
        mockResults();
        await request(app).get("/api/properties?sortBy=L_SystemPrice&sortOrder=desc");

        const sql = selectSql().replace(/\s+/g, " ");
        expect(sql).toMatch(/SELECT id FROM rets_property .*ORDER BY L_SystemPrice IS NULL.* LIMIT \? OFFSET \?/);
        expect(sql).toContain("ON page.id = p.id ORDER BY p.L_SystemPrice IS NULL, p.L_SystemPrice DESC, p.id DESC");
    });

    test("no sort params keeps the original ORDER BY id", async () => {
        mockResults();
        await request(app).get("/api/properties");
        expect(selectSql()).toContain("ORDER BY id LIMIT");
    });

    test.each([
        ["sortBy=price"],                                  // friendly name, not a column
        ["sortBy=id;DROP TABLE rets_property"],            // injection attempt
        ["sortBy=L_Remarks"],                              // real column, not whitelisted
        ["sortBy=constructor"],                            // prototype key
        ["sortBy=L_SystemPrice&sortBy=LM_Int2_3"],         // array value
        ["sortBy=L_SystemPrice&sortOrder=sideways"],       // bad order
        ["sortOrder=up"]                                   // bad order without sortBy
    ])("returns 400 for invalid sort: %s", async (qs) => {
        const res = await request(app).get(`/api/properties?${qs}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/sortBy|sortOrder/);
        expect(pool.query).not.toHaveBeenCalled();
    });
});
