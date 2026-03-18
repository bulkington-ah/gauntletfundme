import { render, screen } from "@testing-library/react";

import { PlaceholderHomePage } from "@/presentation/home";

describe("PlaceholderHomePage", () => {
  it("renders the shared public shell with route entry points", () => {
    render(<PlaceholderHomePage />);

    expect(
      screen.getByRole("heading", { name: "GoFundMe V2" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Public surface foundation")).toBeInTheDocument();
    expect(screen.getByText("Browse fundraisers")).toBeInTheDocument();
    expect(screen.getByText("Browse communities")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Fundraisers" })[0]).toHaveAttribute(
      "href",
      "/fundraisers",
    );
    expect(screen.getAllByRole("link", { name: "Communities" })[0]).toHaveAttribute(
      "href",
      "/communities",
    );
  });
});
