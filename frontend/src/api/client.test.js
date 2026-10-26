import { fetchProperties } from "./client";

test("fetchProperties returns property data", async () => {
    const mockdata = {
        total: 2,
        limit: 20,
        offset: 0,
        results: [
            { id: 1, L_City: "Beverly Hills" },
            { id: 2, L_City: "Lathrop"}
        ]
    }
    globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockdata
    });
    await fetchProperties({ city: "Lathrop" });
    expect(global.fetch).toHaveBeenCalledWith(
        "/api/properties?city=Lathrop"
    )
});

test("fetchProperties throws an error when API fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500
    });

});

test("fetchProperties throws an error when API fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500
    });

    await expect(fetchProperties()).rejects.toThrow(
        "Failed to fetch properties: HTTP 500"
    );
});