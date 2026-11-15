jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const pool = require("../db");
const app = require("../server");

test("logs method, url, status and response time in ms", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    pool.query.mockResolvedValueOnce([[{ 1: 1 }]]);

    await request(app).get("/api/health");

    const line = log.mock.calls.map((c) => c[0]).find((l) => l.includes("/api/health"));
    expect(line).toMatch(/^GET \/api\/health \| .+ \| Status: 200 \| \d+\.\d{2}ms$/);
    log.mockRestore();
});

test("logs failed requests with their status too", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});

    await request(app).get("/api/properties?sortBy=bad");

    const line = log.mock.calls.map((c) => c[0]).find((l) => l.includes("sortBy=bad"));
    expect(line).toMatch(/Status: 400 \| \d+\.\d{2}ms$/);
    log.mockRestore();
});
