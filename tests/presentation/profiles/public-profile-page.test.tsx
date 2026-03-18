import { render, screen } from "@testing-library/react";

import type { PublicProfileResponse, PublicQueryResult } from "@/application";
import {
  PublicProfilePage,
  buildPublicProfilePageModel,
} from "@/presentation/profiles";

const { pushSpy, refreshSpy } = vi.hoisted(() => ({
  pushSpy: vi.fn(),
  refreshSpy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushSpy,
    refresh: refreshSpy,
  }),
}));

describe("PublicProfilePage", () => {
  afterEach(() => {
    pushSpy.mockReset();
    refreshSpy.mockReset();
  });

  it("builds a success page model from the public profile query", async () => {
    const query = createPublicProfileQueryStub({
      result: {
        status: "success",
        data: {
          kind: "profile",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: false,
          },
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
          relationships: {
            followers: [
              {
                displayName: "Jordan Lee",
                profileSlug: "jordan-lee",
                avatarUrl: null,
                role: "supporter",
                profileType: "supporter",
                bio: "Supporter",
              },
            ],
            following: [
              {
                displayName: "Morgan Patel",
                profileSlug: "morgan-patel",
                avatarUrl: null,
                role: "moderator",
                profileType: "supporter",
                bio: "Community moderator",
              },
            ],
          },
          connections: {
            fundraisers: [
              {
                slug: "warm-meals-2026",
                title: "Warm Meals 2026",
                status: "active",
                goalAmount: 250000,
                amountRaised: 22000,
                supporterCount: 5,
                donationCount: 5,
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
      viewerUserId: null,
    });
    expect(model).toEqual({
      status: "success",
      viewerFollowState: {
        isFollowing: false,
        isOwnTarget: false,
      },
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
      relationships: {
        followers: [
          {
            displayName: "Jordan Lee",
            profileSlug: "jordan-lee",
            avatarUrl: null,
            role: "supporter",
            profileType: "supporter",
            bio: "Supporter",
          },
        ],
        following: [
          {
            displayName: "Morgan Patel",
            profileSlug: "morgan-patel",
            avatarUrl: null,
            role: "moderator",
            profileType: "supporter",
            bio: "Community moderator",
          },
        ],
      },
      connections: {
        fundraisers: [
          {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            status: "active",
            goalAmount: 250000,
            amountRaised: 22000,
            supporterCount: 5,
            donationCount: 5,
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
    });
  });

  it("renders profile counters, highlight links, connected communities, and recent activity", () => {
    render(
      <PublicProfilePage
        model={{
          status: "success",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: false,
          },
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
          relationships: {
            followers: [
              {
                displayName: "Jordan Lee",
                profileSlug: "jordan-lee",
                avatarUrl: null,
                role: "supporter",
                profileType: "supporter",
                bio: "Supporter",
              },
            ],
            following: [
              {
                displayName: "Morgan Patel",
                profileSlug: "morgan-patel",
                avatarUrl: null,
                role: "moderator",
                profileType: "supporter",
                bio: "Community moderator",
              },
            ],
          },
          connections: {
            fundraisers: [
              {
                slug: "warm-meals-2026",
                title: "Warm Meals 2026",
                status: "active",
                goalAmount: 250000,
                amountRaised: 22000,
                supporterCount: 5,
                donationCount: 5,
              },
              {
                slug: "winter-coat-drive-2026",
                title: "Winter Coat Drive 2026",
                status: "active",
                goalAmount: 180000,
                amountRaised: 8000,
                supporterCount: 3,
                donationCount: 3,
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
          recentActivity: [
            {
              id: "intent_123",
              type: "fundraiser_donation",
              actor: {
                displayName: "Jordan Lee",
                profileSlug: "jordan-lee",
                avatarUrl: null,
              },
              createdAt: "2026-03-16T12:00:00.000Z",
              summary: "Jordan Lee donated",
              detail: "Warm Meals 2026",
              fundraiser: {
                slug: "warm-meals-2026",
                title: "Warm Meals 2026",
                status: "active",
                goalAmount: 250000,
                amountRaised: 22000,
                supporterCount: 5,
                donationCount: 5,
              },
              community: {
                slug: "neighbors-helping-neighbors",
                name: "Neighbors Helping Neighbors",
                visibility: "public",
              },
              amount: 4200,
            },
            {
              id: "post_123",
              type: "community_post",
              actor: {
                displayName: "Avery Johnson",
                profileSlug: "avery-johnson",
                avatarUrl: null,
              },
              createdAt: "2026-03-16T12:05:00.000Z",
              summary: "Kitchen kickoff update",
              detail: "Meal prep starts Saturday.",
              fundraiser: null,
              community: {
                slug: "neighbors-helping-neighbors",
                name: "Neighbors Helping Neighbors",
                visibility: "public",
              },
              amount: null,
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Avery Johnson" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Organizer profile · Organizer role"),
    ).toBeInTheDocument();
    expect(screen.getByText("Inspired 5 people to help")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "8 followers" }),
    ).toHaveAttribute("href", "/profiles/avery-johnson/followers");
    expect(
      screen.getByRole("link", { name: "2 following" }),
    ).toHaveAttribute("href", "/profiles/avery-johnson/following");
    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
    expect(screen.getByText("Fundraiser momentum")).toBeInTheDocument();
    expect(screen.getByText("Recent public activity")).toBeInTheDocument();

    expect(
      screen
        .getAllByText("Warm Meals 2026")
        .some(
          (element) =>
            element.closest("a")?.getAttribute("href") ===
            "/fundraisers/warm-meals-2026",
        ),
    ).toBe(true);
    expect(
      screen
        .getAllByText("Neighbors Helping Neighbors")
        .some(
          (element) =>
            element.closest("a")?.getAttribute("href") ===
            "/communities/neighbors-helping-neighbors",
        ),
    ).toBe(true);
    expect(screen.getByText("Jordan Lee donated")).toBeInTheDocument();
    expect(screen.getByText("$4,200 donated")).toBeInTheDocument();
    expect(screen.getByText("Kitchen kickoff update")).toBeInTheDocument();
    expect(screen.getByText("Meal prep starts Saturday.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Jordan Lee\s+Mar 16, 2026/i }),
    ).toHaveAttribute("href", "/profiles/jordan-lee");
    expect(
      screen.getByRole("link", { name: "Benefiting Warm Meals 2026" }),
    ).toHaveAttribute("href", "/fundraisers/warm-meals-2026");
    expect(
      screen.getAllByRole("link", { name: "In Neighbors Helping Neighbors" })[0],
    ).toHaveAttribute(
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
    expect(
      screen.getByRole("link", { name: "View seeded profile" }),
    ).toHaveAttribute("href", "/profiles/avery-johnson");

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
    expect(screen.getByRole("link", { name: "Back home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("hides the follow control on a self-owned profile page", () => {
    render(
      <PublicProfilePage
        model={{
          status: "success",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: true,
          },
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
          relationships: {
            followers: [],
            following: [],
          },
          connections: {
            fundraisers: [],
            communities: [],
          },
          recentActivity: [],
        }}
        viewer={{
          userId: "user_organizer_avery",
          role: "organizer",
        }}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Follow" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Unfollow" }),
    ).not.toBeInTheDocument();
  });
});

const createPublicProfileQueryStub = ({
  result,
}: {
  result: PublicQueryResult<PublicProfileResponse>;
}) => ({
  getPublicProfileBySlug: vi.fn().mockResolvedValue(result),
});
