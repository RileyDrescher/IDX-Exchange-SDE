import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import RouteErrorBoundary, { ErrorBoundary } from "./ErrorBoundary";

let shouldThrow = true;

function Bomb() {
    if (shouldThrow) {
        throw new Error("Boom");
    }
    return <p>Recovered content</p>;
}

beforeEach(() => {
    shouldThrow = true;
    // React logs caught render errors; keep test output readable.
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    console.error.mockRestore();
});

test("renders children when nothing throws", () => {
    shouldThrow = false;
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(screen.getByText("Recovered content")).toBeInTheDocument();
});

test("shows the recovery screen when a child throws", () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("This page hit a problem")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to listings" })).toHaveAttribute("href", "/");
});

test("logs the error for developers", () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(console.error).toHaveBeenCalledWith(
        "Page crashed:", expect.any(Error), expect.anything()
    );
});

test("Try again re-renders the children", () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
});

test("navigating to another route clears the error", () => {
    render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={["/broken"]}>
            <Link to="/">Home</Link>
            <RouteErrorBoundary>
                <Routes>
                    <Route path="/broken" element={<Bomb />} />
                    <Route path="/" element={<p>Listings page</p>} />
                </Routes>
            </RouteErrorBoundary>
        </MemoryRouter>
    );

    expect(screen.getByText("This page hit a problem")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(screen.getByText("Listings page")).toBeInTheDocument();
});
