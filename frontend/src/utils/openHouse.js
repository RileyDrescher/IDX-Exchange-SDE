// "2026-03-14" or "2026-03-14T00:00:00.000Z" -> "March 14, 2026".
// Uses only the date part so the day doesn't shift with the time zone.
export function formatOpenHouseDate(dateString) {
    if (!dateString) {
        return "N/A";
    }

    const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

// "13:30:00" -> "1:30 PM"
export function formatOpenHouseTime(timeString) {
    if (!timeString) {
        return "N/A";
    }

    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 || 12;

    return `${formattedHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

// Open house remarks are stored inside the all_data JSON column.
export function getOpenHouseRemarks(allData) {
    try {
        if (!allData) {
            return null;
        }

        const data = typeof allData === "string" ? JSON.parse(allData) : allData;

        return typeof data?.OpenHouseRemarks === "string"
            ? data.OpenHouseRemarks.trim() || null
            : null;
    } catch {
        return null;
    }
}
