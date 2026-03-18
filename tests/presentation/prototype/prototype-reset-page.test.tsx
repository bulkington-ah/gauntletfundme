import { render, screen } from "@testing-library/react";

import { PrototypeResetPage } from "@/presentation/prototype";

describe("PrototypeResetPage", () => {
  it("renders the hidden reset page warning and button", () => {
    render(<PrototypeResetPage />);

    expect(
      screen.getByRole("heading", { name: "Reset prototype data" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This hidden page restores the full demo catalog/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/this hard reset clears all current users, sessions/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset prototype data" }),
    ).toBeInTheDocument();
  });
});
