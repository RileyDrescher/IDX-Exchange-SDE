import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the listings page with site navigation", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /property listings/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
});
