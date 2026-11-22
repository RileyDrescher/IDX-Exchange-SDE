import { formatPrice, formatNumber } from "./format";

test("formatPrice adds a dollar sign and thousands separators", () => {
    expect(formatPrice(1250000)).toBe("$1,250,000");
    expect(formatPrice("995000")).toBe("$995,000");
});

test("formatPrice handles missing values", () => {
    expect(formatPrice(null)).toBe("Price on request");
    expect(formatPrice(undefined)).toBe("Price on request");
    expect(formatPrice("")).toBe("Price on request");
    expect(formatPrice("abc")).toBe("Price on request");
});

test("formatPrice keeps a real zero", () => {
    expect(formatPrice(0)).toBe("$0");
});

test("formatNumber formats decimals and thousands", () => {
    expect(formatNumber(1800)).toBe("1,800");
    expect(formatNumber("2.5")).toBe("2.5");
});

test("formatNumber shows a dash for missing values", () => {
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber("")).toBe("—");
});
