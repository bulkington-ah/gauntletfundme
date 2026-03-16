import { render, screen } from "@testing-library/react";

import { PlaceholderHomePage } from "@/presentation/home";

describe("PlaceholderHomePage", () => {
  it("renders the project scaffold placeholder content", () => {
    render(<PlaceholderHomePage />);

    expect(
      screen.getByRole("heading", { name: "GoFundMe V2" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Task 001 scaffold")).toBeInTheDocument();
    expect(screen.getByText("presentation")).toBeInTheDocument();
  });
});
