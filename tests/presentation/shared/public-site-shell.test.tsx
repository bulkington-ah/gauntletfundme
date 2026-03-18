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
    expect(screen.getAllByRole("link", { name: "Communities" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Fundraisers" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
    expect(screen.queryByText("Search")).not.toBeInTheDocument();
    expect(screen.queryByText("Donate")).not.toBeInTheDocument();
    expect(screen.queryByText("Giving Funds")).not.toBeInTheDocument();
    expect(screen.queryByText("Start a GoFundMe")).not.toBeInTheDocument();
    expect(screen.getByText("Shell body")).toBeInTheDocument();
  });

  it("renders signed-in controls and a profile link when a viewer profile slug is available", () => {
    render(
      <PublicSiteShell
        returnTo="/profiles/avery-johnson"
        viewer={{
          userId: "user_organizer_avery",
          role: "organizer",
        }}
        viewerProfileSlug="avery-johnson"
      >
        <div>Shell body</div>
      </PublicSiteShell>,
    );

    expect(screen.getAllByRole("link", { name: "Profile" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Communities" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Fundraisers" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Sign out" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("omits the profile link when the signed-in viewer has no public profile slug", () => {
    render(
      <PublicSiteShell
        returnTo="/communities"
        viewer={{
          userId: "user_without_profile",
          role: "supporter",
        }}
        viewerProfileSlug={null}
      >
        <div>Shell body</div>
      </PublicSiteShell>,
    );

    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Sign out" })).toHaveLength(2);
  });
});
