import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ListingsPage from "./ListingsPage";
import { fetchProperties } from "../api/client";

jest.mock("../api/client");

const page = (ids) => ({
    total: 60,
    limit: 20,
    offset: 0,
    results: ids.map((id) => ({
        id,
        L_Address: `${id} Main St`,
        L_SystemPrice: id * 1000,
        L_City: "Lathrop",
        L_State: "CA",
        L_Keyword2: 3,
        LM_Dec_3: 2,
        LM_Int2_3: 1500,
        L_Photos: null
    }))
});

function lastCallParams() {
    const calls = fetchProperties.mock.calls;
    return calls[calls.length - 1][0];
}

async function renderPage() {
    render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ListingsPage />
        </MemoryRouter>
    );
    await screen.findByText("1 Main St");
}

beforeEach(() => {
    fetchProperties.mockReset();
    fetchProperties.mockResolvedValue(page([1, 2]));
    jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("default request has no sort params", async () => {
    await renderPage();
    expect(lastCallParams()).not.toHaveProperty("sortBy");
    expect(lastCallParams()).not.toHaveProperty("sortOrder");
});

test("selecting a sort requests page 1 with sortBy and sortOrder", async () => {
    await renderPage();

    fireEvent.change(screen.getByLabelText("Sort by"), {
        target: { value: "L_SystemPrice:asc" }
    });

    await waitFor(() =>
        expect(lastCallParams()).toEqual(
            expect.objectContaining({ sortBy: "L_SystemPrice", sortOrder: "asc", offset: 0 })
        )
    );
});

test("sorting persists across pagination", async () => {
    await renderPage();

    fireEvent.change(screen.getByLabelText("Sort by"), {
        target: { value: "L_SystemPrice:desc" }
    });
    await waitFor(() => expect(lastCallParams().sortOrder).toBe("desc"));
    await screen.findByText("1 Main St");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() =>
        expect(lastCallParams()).toEqual(
            expect.objectContaining({ sortBy: "L_SystemPrice", sortOrder: "desc", offset: 20 })
        )
    );
});

test("sorting resets when filters change", async () => {
    await renderPage();

    fireEvent.change(screen.getByLabelText("Sort by"), {
        target: { value: "LM_Int2_3:desc" }
    });
    await waitFor(() => expect(lastCallParams().sortBy).toBe("LM_Int2_3"));
    await screen.findByText("1 Main St");

    fireEvent.change(screen.getByPlaceholderText("City"), { target: { value: "Lathrop" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => expect(lastCallParams()).toEqual(
        expect.objectContaining({ city: "Lathrop", offset: 0 })
    ));
    expect(lastCallParams()).not.toHaveProperty("sortBy");
    expect(screen.getByLabelText("Sort by")).toHaveValue("");
});
