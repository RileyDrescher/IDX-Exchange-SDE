function isNumeric(value) {
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

// 1250000 -> "$1,250,000"; missing values -> "Price on request"
export function formatPrice(value) {
    return isNumeric(value)
        ? `$${Number(value).toLocaleString()}`
        : "Price on request";
}

// 1800 -> "1,800"; "2.5" -> "2.5"; missing values -> "—"
export function formatNumber(value) {
    return isNumeric(value)
        ? Number(value).toLocaleString()
        : "—";
}
