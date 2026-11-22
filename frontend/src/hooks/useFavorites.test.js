import { renderHook, act } from "@testing-library/react";
import {
    useFavorites,
    resetFavoritesCache,
    FAVORITES_STORAGE_KEY
} from "./useFavorites";

const home = (id, extra = {}) => ({
    id,
    L_Address: `${id} Main St`,
    L_SystemPrice: 500000,
    L_Remarks: "a very long description that should not be stored",
    ...extra
});

beforeEach(() => {
    window.localStorage.clear();
    resetFavoritesCache();
});

test("starts empty", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.count).toBe(0);
});

test("toggleFavorite adds then removes a property", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(home(1)));
    expect(result.current.isFavorite(1)).toBe(true);
    expect(result.current.count).toBe(1);

    act(() => result.current.toggleFavorite(home(1)));
    expect(result.current.isFavorite(1)).toBe(false);
    expect(result.current.count).toBe(0);
});

test("persists to localStorage with only card fields", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite(home(7)));

    const stored = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY));
    expect(stored).toEqual([{ id: 7, L_Address: "7 Main St", L_SystemPrice: 500000 }]);
});

test("restores favorites after a refresh", () => {
    window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify([{ id: 3, L_Address: "3 Main St" }])
    );

    const { result } = renderHook(() => useFavorites());
    expect(result.current.isFavorite(3)).toBe(true);
    expect(result.current.isFavorite("3")).toBe(true); // route params are strings
});

test("does not add duplicates", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
        result.current.addFavorite(home(2));
        result.current.addFavorite(home(2));
    });
    expect(result.current.count).toBe(1);
});

test("removeFavorite removes only that property", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
        result.current.addFavorite(home(1));
        result.current.addFavorite(home(2));
    });
    act(() => result.current.removeFavorite(1));
    expect(result.current.favorites.map((f) => f.id)).toEqual([2]);
});

test("ignores corrupt localStorage data", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, "{not json");
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
});

test("ignores non-array or malformed stored data", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([null, { foo: 1 }, { id: 4 }]));
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([{ id: 4 }]);
});

test("separate components stay in sync", () => {
    const { result: first } = renderHook(() => useFavorites());
    const { result: second } = renderHook(() => useFavorites());

    act(() => first.current.addFavorite(home(9)));
    expect(second.current.isFavorite(9)).toBe(true);
});
