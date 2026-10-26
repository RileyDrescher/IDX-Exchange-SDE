import { render, screen, fireEvent } from "@testing-library/react";
import PropertyFilters from "./PropertyFilters";


test("renders all six property filters", () => {
    const mockSearch = jest.fn();

    render(<PropertyFilters onSearch={mockSearch} />);
    expect(screen.getByPlaceholderText("City")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ZIP Code")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Max Price")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
});

test("submits city filter when Search is clicked", () => {
    const mockSearch = jest.fn();

    render(<PropertyFilters onSearch={mockSearch} />);

    fireEvent.change(screen.getByPlaceholderText("City"), {
        target: { value: "Lathrop" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
        expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({ city: "Lathrop" })
    );
});

test("clears filters when Clear Filters is clicked", () => {
    const mockSearch = jest.fn();

    render(<PropertyFilters onSearch={mockSearch} />);

    fireEvent.change(screen.getByPlaceholderText("City"), {
        target: { value: "Lathrop" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear Filters" }));

    expect(screen.getByPlaceholderText("City")).toHaveValue("");
    expect(mockSearch).toHaveBeenCalledWith({});
});