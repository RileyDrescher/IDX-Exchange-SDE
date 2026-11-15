import { useCallback, useMemo, useSyncExternalStore } from "react";

export const FAVORITES_STORAGE_KEY = "idx-favorites";

// Only the fields a PropertyCard needs, so localStorage stays small and the
// Favorites page can render without calling the API.
const CARD_FIELDS = [
    "id",
    "L_Address",
    "L_SystemPrice",
    "L_City",
    "L_State",
    "L_Zip",
    "L_Keyword2",
    "LM_Dec_3",
    "LM_Int2_3",
    "L_Photos"
];

const EMPTY = Object.freeze([]);
const listeners = new Set();
let cache = null;

function readFavorites() {
    if (cache !== null) {
        return cache;
    }

    try {
        const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
        cache = Array.isArray(parsed)
            ? parsed.filter((item) => item && item.id !== undefined && item.id !== null)
            : [];
    } catch {
        // Corrupt JSON or storage blocked (private mode): start empty.
        cache = [];
    }

    return cache;
}

function writeFavorites(next) {
    cache = next;

    try {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    } catch {
        // Storage full or blocked: keep working in memory for this session.
    }

    listeners.forEach((listener) => listener());
}

function subscribe(listener) {
    listeners.add(listener);

    // Keep other open tabs in sync.
    function handleStorage(event) {
        if (event.key === FAVORITES_STORAGE_KEY) {
            cache = null;
            listener();
        }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
    };
}

function toFavorite(property) {
    return Object.fromEntries(
        CARD_FIELDS.filter((field) => property[field] !== undefined)
            .map((field) => [field, property[field]])
    );
}

const sameId = (a, b) => String(a) === String(b);

// Test helper: forget the in-memory copy so the next read uses localStorage.
export function resetFavoritesCache() {
    cache = null;
}

// One shared store means every heart, the header count and the Favorites
// page update together, without needing a context provider.
export function useFavorites() {
    const favorites = useSyncExternalStore(subscribe, readFavorites, () => EMPTY);

    const isFavorite = useCallback(
        (id) => favorites.some((item) => sameId(item.id, id)),
        [favorites]
    );

    const addFavorite = useCallback((property) => {
        const current = readFavorites();
        if (!current.some((item) => sameId(item.id, property.id))) {
            writeFavorites([toFavorite(property), ...current]);
        }
    }, []);

    const removeFavorite = useCallback((id) => {
        writeFavorites(readFavorites().filter((item) => !sameId(item.id, id)));
    }, []);

    const toggleFavorite = useCallback((property) => {
        const current = readFavorites();
        if (current.some((item) => sameId(item.id, property.id))) {
            writeFavorites(current.filter((item) => !sameId(item.id, property.id)));
        } else {
            writeFavorites([toFavorite(property), ...current]);
        }
    }, []);

    return useMemo(() => ({
        favorites,
        count: favorites.length,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite
    }), [favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite]);
}

export default useFavorites;
