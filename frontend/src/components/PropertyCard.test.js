import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { resetFavoritesCache } from "../hooks/useFavorites";

const property = {
    id: 42,
    L_Address: "42 Ocean Ave",
    L_SystemPrice: 1250000,
    L_City: "Irvine",
    L_State: "CA",
    L_Keyword2: 3,
    LM_Dec_3: "2.5",
    LM_Int2_3: 1800,
    L_Photos: null
};

function renderCard() {
    render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={["/"]}>
            <Routes>
                <Route path="/" element={<PropertyCard property={property} />} />
                <Route path="/property/:id" element={<p>Detail page</p>} />
            </Routes>
        </MemoryRouter>
    );
}

beforeEach(() => {
    window.localStorage.clear();
    resetFavoritesCache();
});

test("shows price, address and stats", () => {
    renderCard();
    expect(screen.getByText("$1,250,000")).toBeInTheDocument();
    expect(screen.getByText("42 Ocean Ave")).toBeInTheDocument();
    expect(screen.getByText("2.5")).toBeInTheDocument();
});

test("heart toggles favorite without navigating", () => {
    renderCard();

    const heart = screen.getByRole("button", { name: "Save 42 Ocean Ave to favorites" });
    expect(heart).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(heart);

    expect(screen.queryByText("Detail page")).not.toBeInTheDocument();
    expect(
        screen.getByRole("button", { name: "Remove 42 Ocean Ave from favorites" })
    ).toHaveAttribute("aria-pressed", "true");
});

test("clicking the card details still navigates", () => {
    renderCard();
    fireEvent.click(screen.getByText("42 Ocean Ave"));
    expect(screen.getByText("Detail page")).toBeInTheDocument();
});

test("handles a missing price", () => {
    render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <PropertyCard property={{ ...property, L_SystemPrice: null }} />
        </MemoryRouter>
    );
    expect(screen.getByText("Price on request")).toBeInTheDocument();
});
