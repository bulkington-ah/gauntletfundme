import { render, screen } from "@testing-library/react";

import { PlaceholderHomePage } from "@/presentation/home";

describe("PlaceholderHomePage", () => {
  it("renders the shared public shell with a single homepage image", () => {
    render(<PlaceholderHomePage />);

    expect(
      screen.getByRole("img", {
        name: "Volunteers and children planting a young tree together outdoors",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "GoFundMe V2" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Public surface foundation")).not.toBeInTheDocument();
    expect(screen.queryByText("Browse fundraisers")).not.toBeInTheDocument();
    expect(screen.queryByText("Browse communities")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "gauntletfundme" })).toHaveAttribute(
      "href",
      "/",
    );
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
