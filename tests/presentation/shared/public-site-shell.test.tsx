import { render, screen } from "@testing-library/react";

import { PublicSiteShell } from "@/presentation/shared";

const refreshMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
    replace: replaceMock,
  }),
}));

describe("PublicSiteShell", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    replaceMock.mockReset();
  });

  it("renders sign-in links for anonymous visitors", () => {
    render(
      <PublicSiteShell returnTo="/fundraisers/warm-meals-2026" viewer={null}>
        <div>Shell body</div>
      </PublicSiteShell>,
    );

    const signInLinks = screen.getAllByRole("link", { name: "Sign in" });

    expect(signInLinks[0]).toHaveAttribute(
      "href",
      "/login?next=%2Ffundraisers%2Fwarm-meals-2026",
    );
    expect(screen.getByText("Shell body")).toBeInTheDocument();
  });

  it("renders signed-in controls when a viewer is present", () => {
    render(
      <PublicSiteShell
        returnTo="/profiles/avery-johnson"
        viewer={{
          userId: "user_organizer_avery",
          role: "organizer",
        }}
      >
        <div>Shell body</div>
      </PublicSiteShell>,
    );

    expect(screen.getAllByText("Organizer").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Sign out" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });
});
