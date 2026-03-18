import { render, screen } from "@testing-library/react";

import { PublicProfileRelationshipsPage } from "@/presentation/profiles";

describe("PublicProfileRelationshipsPage", () => {
  it("renders followers and following tabs with linked member rows", () => {
    render(
      <PublicProfileRelationshipsPage
        model={{
          status: "success",
          profile: {
            slug: "avery-johnson",
            displayName: "Avery Johnson",
            role: "organizer",
            profileType: "organizer",
            bio: "Organizer building long-term community support.",
            avatarUrl: null,
            followerCount: 2,
            followingCount: 1,
            inspiredSupporterCount: 5,
          },
          relationships: {
            followers: [
              {
                displayName: "Jordan Lee",
                profileSlug: "jordan-lee",
                avatarUrl: null,
                role: "supporter",
                profileType: "supporter",
                bio: "Supporter showing up for food access.",
              },
              {
                displayName: "Elena Gomez",
                profileSlug: "elena-gomez",
                avatarUrl: null,
                role: "supporter",
                profileType: "supporter",
                bio: "Mutual aid volunteer.",
              },
            ],
            following: [
              {
                displayName: "Morgan Patel",
                profileSlug: "morgan-patel",
                avatarUrl: null,
                role: "moderator",
                profileType: "supporter",
                bio: "Moderator helping keep the space safe.",
              },
            ],
          },
          connections: {
            fundraisers: [],
            communities: [],
          },
          recentActivity: [],
        }}
        relationship="followers"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Avery Johnson followers" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "← Back to Avery Johnson" }),
    ).toHaveAttribute("href", "/profiles/avery-johnson");
    expect(
      screen.getByRole("link", { name: "2 followers" }),
    ).toHaveAttribute("href", "/profiles/avery-johnson/followers");
    expect(
      screen.getByRole("link", { name: "1 following" }),
    ).toHaveAttribute("href", "/profiles/avery-johnson/following");
    expect(
      screen.getByRole("link", {
        name: /Jordan Lee\s+Supporter profile · Supporter/i,
      }),
    ).toHaveAttribute("href", "/profiles/jordan-lee");
  });
});
