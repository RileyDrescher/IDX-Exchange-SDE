import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FavoritesPage from "./FavoritesPage";
import SiteHeader from "../components/SiteHeader";
import { resetFavoritesCache, FAVORITES_STORAGE_KEY } from "../hooks/useFavorites";

function seed(favorites) {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    resetFavoritesCache();
}

function renderPage() {
    render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SiteHeader />
            <FavoritesPage />
        </MemoryRouter>
    );
}

beforeEach(() => {
    window.localStorage.clear();
    resetFavoritesCache();
});

test("shows an empty state with a link back to listings", () => {
    renderPage();
    expect(screen.getByText("0 saved homes")).toBeInTheDocument();
    expect(screen.getByText(/No favorites yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse listings" })).toHaveAttribute("href", "/");
});

test("shows only favorited properties and the count", () => {
    seed([
        { id: 1, L_Address: "1 Elm St", L_SystemPrice: 100 },
        { id: 2, L_Address: "2 Oak St", L_SystemPrice: 200 }
    ]);
    renderPage();

    expect(screen.getByText("2 saved homes")).toBeInTheDocument();
    expect(screen.getByText("1 Elm St")).toBeInTheDocument();
    expect(screen.getByText("2 Oak St")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
});

test("removing a favorite updates the list and header count immediately", () => {
    seed([
        { id: 1, L_Address: "1 Elm St" },
        { id: 2, L_Address: "2 Oak St" }
    ]);
    renderPage();

    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: /Favorites/ })).toHaveTextContent("2");

    fireEvent.click(screen.getByRole("button", { name: "Remove 1 Elm St from favorites" }));

    expect(screen.queryByText("1 Elm St")).not.toBeInTheDocument();
    expect(screen.getByText("1 saved home")).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Favorites/ })).toHaveTextContent("1");
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY))).toHaveLength(1);
});
