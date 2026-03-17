import { render, screen } from "@testing-library/react";

import { PlaceholderHomePage } from "@/presentation/home";

describe("PlaceholderHomePage", () => {
  it("renders the shared public shell with route entry points", () => {
    render(<PlaceholderHomePage />);

    expect(
      screen.getByRole("heading", { name: "GoFundMe V2" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Public surface foundation")).toBeInTheDocument();
    expect(screen.getByText("Explore fundraiser")).toBeInTheDocument();
    expect(screen.getByText("Explore community")).toBeInTheDocument();
    expect(screen.getByText("Explore profile")).toBeInTheDocument();
    expect(screen.getAllByText("Start a GoFundMe")[0]).toBeInTheDocument();
  });
});
