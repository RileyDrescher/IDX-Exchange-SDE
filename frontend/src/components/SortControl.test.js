import { render, screen, fireEvent } from "@testing-library/react";
import SortControl from "./SortControl";

test("shows Default when no sort is selected", () => {
    render(<SortControl sortBy="" sortOrder="" onSortChange={jest.fn()} />);
    expect(screen.getByLabelText("Sort by")).toHaveValue("");
});

test("reflects the current sort", () => {
    render(<SortControl sortBy="L_SystemPrice" sortOrder="desc" onSortChange={jest.fn()} />);
    expect(screen.getByLabelText("Sort by")).toHaveValue("L_SystemPrice:desc");
});

test("sends column and order when an option is chosen", () => {
    const onSortChange = jest.fn();
    render(<SortControl sortBy="" sortOrder="" onSortChange={onSortChange} />);

    fireEvent.change(screen.getByLabelText("Sort by"), {
        target: { value: "ListingContractDate:desc" }
    });

    expect(onSortChange).toHaveBeenCalledWith({
        sortBy: "ListingContractDate",
        sortOrder: "desc"
    });
});

test("choosing Default clears the sort", () => {
    const onSortChange = jest.fn();
    render(<SortControl sortBy="L_SystemPrice" sortOrder="asc" onSortChange={onSortChange} />);

    fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "" } });

    expect(onSortChange).toHaveBeenCalledWith({ sortBy: "", sortOrder: "" });
});
