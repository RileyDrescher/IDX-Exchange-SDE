import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "./Pagination";

test("disables Previous button on first page", () => {
    const mockPageChange = jest.fn();

    render (
        <Pagination
            currentPage={1}
            totalPages={10}
            onPageChange={mockPageChange}
        />
    );

    expect(screen.getByRole("button", {name: "Previous"})).toBeDisabled();
})

test("disables Next button on last page", () => {
    const mockPageChange = jest.fn();

    render (
        <Pagination
            currentPage={10}
            totalPages={10}
            onPageChange={mockPageChange}
        />
    );

    expect(screen.getByRole("button", {name: "Next"})).toBeDisabled();
});

test("clicking a page number calls onPageChange", () => {
    const mockPageChange = jest.fn();

    render(
        <Pagination
            currentPage={1}
            totalPages={10}
            onPageChange={mockPageChange}
        />
    );

    fireEvent.click(screen.getByRole("button", { name: "3" }));

    expect(mockPageChange).toHaveBeenCalledWith(3);
});

test("Previous and Next buttons navigate correctly", () => {
    const mockPageChange = jest.fn();

    render(
        <Pagination
            currentPage={5}
            totalPages={10}
            onPageChange={mockPageChange}
        />
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(mockPageChange).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(mockPageChange).toHaveBeenCalledWith(6);
});

test("displays ellipses for middle pages", () => {
    const mockPageChange = jest.fn();

    render(
        <Pagination
            currentPage={5}
            totalPages={24}
            onPageChange={mockPageChange}
        />
    );

    expect(screen.getAllByText("...")).toHaveLength(2);

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "24" })).toBeInTheDocument();
});

test("hides pagination when there is only one page", () => {
    const mockPageChange = jest.fn();

    render(
        <Pagination
            currentPage={1}
            totalPages={1}
            onPageChange={mockPageChange}
        />
    );

    expect(
        screen.queryByRole("navigation", { name: "Property pagination" })
    ).not.toBeInTheDocument();
});

test("does not duplicate the last page number near the end", () => {
    const mockPageChange = jest.fn();

    render(
        <Pagination
            currentPage={23}
            totalPages={24}
            onPageChange={mockPageChange}
        />
    );

    expect(
        screen.getAllByRole("button", { name: "24" })
    ).toHaveLength(1);

    expect(
        screen.getAllByRole("button", { name: "1" })
    ).toHaveLength(1);

    expect(
        screen.getByRole("button", { name: "23" })
    ).toHaveAttribute("aria-current", "page");
});