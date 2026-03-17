import { render, screen } from "@testing-library/react";

import type { PublicProfileResponse, PublicQueryResult } from "@/application";
import {
  PublicProfilePage,
  buildPublicProfilePageModel,
} from "@/presentation/profiles";

describe("PublicProfilePage", () => {
  it("builds a success page model from the public profile query", async () => {
    const query = createPublicProfileQueryStub({
      result: {
        status: "success",
        data: {
          kind: "profile",
          profile: {
            slug: "avery-johnson",
            displayName: "Avery Johnson",
            role: "organizer",
            profileType: "organizer",
            bio: "Organizer building long-term community support.",
            avatarUrl: null,
            followerCount: 8,
            followingCount: 2,
            inspiredSupporterCount: 5,
          },
          connections: {
            fundraisers: [
              {
                slug: "warm-meals-2026",
                title: "Warm Meals 2026",
                status: "active",
                goalAmount: 250000,
                supportAmount: 22000,
                supporterCount: 5,
                donationIntentCount: 5,
              },
            ],
            communities: [
              {
                slug: "neighbors-helping-neighbors",
                name: "Neighbors Helping Neighbors",
                visibility: "public",
              },
            ],
          },
          recentActivity: [],
        },
      },
    });

    const model = await buildPublicProfilePageModel(
      {
        publicProfileQuery: query,
      },
      "avery-johnson",
    );

    expect(query.getPublicProfileBySlug).toHaveBeenCalledWith({
      slug: "avery-johnson",
    });
    expect(model).toEqual({
      status: "success",
      profile: {
        slug: "avery-johnson",
        displayName: "Avery Johnson",
        role: "organizer",
        profileType: "organizer",
        bio: "Organizer building long-term community support.",
        avatarUrl: null,
        followerCount: 8,
        followingCount: 2,
        inspiredSupporterCount: 5,
      },
      connections: {
        fundraisers: [
          {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            status: "active",
            goalAmount: 250000,
            supportAmount: 22000,
            supporterCount: 5,
            donationIntentCount: 5,
          },
        ],
        communities: [
          {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
          },
        ],
      },
    });
  });

  it("renders organizer profile context and connected entity links", () => {
    render(
      <PublicProfilePage
        model={{
          status: "success",
          profile: {
            slug: "avery-johnson",
            displayName: "Avery Johnson",
            role: "organizer",
            profileType: "organizer",
            bio: "Organizer building long-term community support.",
            avatarUrl: null,
            followerCount: 8,
          },
          connections: {
            fundraisers: [
              {
                slug: "warm-meals-2026",
                title: "Warm Meals 2026",
                status: "active",
                goalAmount: 250000,
              },
            ],
            communities: [
              {
                slug: "neighbors-helping-neighbors",
                name: "Neighbors Helping Neighbors",
                visibility: "public",
              },
            ],
          },
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Avery Johnson" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Organizer profile · Organizer role"),
    ).toBeInTheDocument();
    expect(screen.getByText("Followers:")).toBeInTheDocument();
    expect(screen.getAllByText("Start a GoFundMe")[0]).toBeInTheDocument();

    const fundraiserLink = screen.getByRole("link", { name: "Warm Meals 2026" });
    expect(fundraiserLink).toHaveAttribute("href", "/fundraisers/warm-meals-2026");

    const communityLink = screen.getByRole("link", {
      name: "Neighbors Helping Neighbors",
    });
    expect(communityLink).toHaveAttribute(
      "href",
      "/communities/neighbors-helping-neighbors",
    );
  });

  it("renders profile-not-found and invalid-request states", () => {
    const { rerender } = render(
      <PublicProfilePage
        model={{
          status: "not_found",
          slug: "missing-slug",
          message: 'No public profile was found for slug "missing-slug".',
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Profile not found" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tried slug:/)).toBeInTheDocument();
    expect(screen.getAllByText("Start a GoFundMe")[0]).toBeInTheDocument();

    rerender(
      <PublicProfilePage
        model={{
          status: "invalid_request",
          message: "slug is required.",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Invalid profile request" }),
    ).toBeInTheDocument();
    expect(screen.getByText("slug is required.")).toBeInTheDocument();
    expect(screen.getAllByText("Start a GoFundMe")[0]).toBeInTheDocument();
  });
});

const createPublicProfileQueryStub = ({
  result,
}: {
  result: PublicQueryResult<PublicProfileResponse>;
}) => ({
  getPublicProfileBySlug: vi.fn().mockResolvedValue(result),
});
