import {
    formatOpenHouseDate,
    formatOpenHouseTime,
    getOpenHouseRemarks
} from "./openHouse";

test("formats dates without shifting the day", () => {
    expect(formatOpenHouseDate("2026-03-14")).toBe("March 14, 2026");
    expect(formatOpenHouseDate("2026-03-14T00:00:00.000Z")).toBe("March 14, 2026");
    expect(formatOpenHouseDate(null)).toBe("N/A");
});

test("formats 24-hour times as 12-hour", () => {
    expect(formatOpenHouseTime("13:30:00")).toBe("1:30 PM");
    expect(formatOpenHouseTime("00:05:00")).toBe("12:05 AM");
    expect(formatOpenHouseTime("12:00:00")).toBe("12:00 PM");
    expect(formatOpenHouseTime("")).toBe("N/A");
});

test("reads remarks from all_data JSON", () => {
    expect(getOpenHouseRemarks('{"OpenHouseRemarks":"  Bring ID  "}')).toBe("Bring ID");
    expect(getOpenHouseRemarks({ OpenHouseRemarks: "" })).toBeNull();
    expect(getOpenHouseRemarks("not json")).toBeNull();
    expect(getOpenHouseRemarks(null)).toBeNull();
});
