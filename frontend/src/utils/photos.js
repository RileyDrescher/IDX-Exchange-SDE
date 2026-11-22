// L_Photos comes from MySQL as a JSON string (or already-parsed array).
// Returns a clean array of photo URLs, or [] for anything invalid.
export function parsePhotos(photosData) {
    try {
        if (!photosData) {
            return [];
        }

        const photos = typeof photosData === "string"
            ? JSON.parse(photosData)
            : photosData;

        if (!Array.isArray(photos)) {
            return [];
        }

        return photos.filter(
            (photo) => typeof photo === "string" && photo.trim()
        );
    } catch {
        return [];
    }
}
