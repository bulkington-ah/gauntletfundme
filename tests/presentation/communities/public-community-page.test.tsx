import { render, screen } from "@testing-library/react";

import type { PublicCommunityResponse, PublicQueryResult } from "@/application";
import {
  PublicCommunityPage,
  buildPublicCommunityPageModel,
} from "@/presentation/communities";

describe("PublicCommunityPage", () => {
  it("builds a success page model from the public community query", async () => {
    const query = createPublicCommunityQueryStub({
      result: {
        status: "success",
        data: {
          kind: "community",
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            description: "A public space for updates and volunteer coordination.",
            visibility: "public",
            followerCount: 12,
            fundraiserCount: 2,
            amountRaised: 18700,
            donationCount: 6,
          },
          owner: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: null,
          },
          featuredFundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            status: "active",
            goalAmount: 250000,
            amountRaised: 12600,
            supporterCount: 3,
            donationCount: 4,
          },
          leaderboard: [
            {
              rank: 1,
              fundraiser: {
                slug: "warm-meals-2026",
                title: "Warm Meals 2026",
                status: "active",
                goalAmount: 250000,
                amountRaised: 12600,
                supporterCount: 3,
                donationCount: 4,
              },
            },
          ],
          fundraisers: [
            {
              slug: "warm-meals-2026",
              title: "Warm Meals 2026",
              status: "active",
              goalAmount: 250000,
              amountRaised: 12600,
              supporterCount: 3,
              donationCount: 4,
            },
          ],
          discussion: [
            {
              id: "post_123",
              title: "Kitchen kickoff update",
              body: "Our first prep day starts this Saturday.",
              status: "published",
              moderationStatus: "visible",
              authorDisplayName: "Avery Johnson",
              createdAt: "2026-03-16T10:00:00.000Z",
              comments: [
                {
                  id: "comment_123",
                  body: "I can help with setup.",
                  moderationStatus: "visible",
                  authorDisplayName: "Jordan Lee",
                  createdAt: "2026-03-16T10:15:00.000Z",
                },
              ],
            },
          ],
        },
      },
    });

    const model = await buildPublicCommunityPageModel(
      {
        publicCommunityQuery: query,
      },
      "neighbors-helping-neighbors",
    );

    expect(query.getPublicCommunityBySlug).toHaveBeenCalledWith({
      slug: "neighbors-helping-neighbors",
    });
    expect(model).toEqual({
      status: "success",
      community: {
        slug: "neighbors-helping-neighbors",
        name: "Neighbors Helping Neighbors",
        description: "A public space for updates and volunteer coordination.",
        visibility: "public",
        followerCount: 12,
        fundraiserCount: 2,
        amountRaised: 18700,
        donationCount: 6,
      },
      owner: {
        displayName: "Avery Johnson",
        role: "organizer",
        profileSlug: "avery-johnson",
        avatarUrl: null,
      },
      featuredFundraiser: {
        slug: "warm-meals-2026",
        title: "Warm Meals 2026",
        status: "active",
        goalAmount: 250000,
        amountRaised: 12600,
        supporterCount: 3,
        donationCount: 4,
      },
      leaderboard: [
        {
          rank: 1,
          fundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            status: "active",
            goalAmount: 250000,
            amountRaised: 12600,
            supporterCount: 3,
            donationCount: 4,
          },
        },
      ],
      fundraisers: [
        {
          slug: "warm-meals-2026",
          title: "Warm Meals 2026",
          status: "active",
          goalAmount: 250000,
          amountRaised: 12600,
          supporterCount: 3,
          donationCount: 4,
        },
      ],
      discussion: [
        {
          id: "post_123",
          title: "Kitchen kickoff update",
          body: "Our first prep day starts this Saturday.",
          status: "published",
          moderationStatus: "visible",
          authorDisplayName: "Avery Johnson",
          createdAt: "2026-03-16T10:00:00.000Z",
          comments: [
            {
              id: "comment_123",
              body: "I can help with setup.",
              moderationStatus: "visible",
              authorDisplayName: "Jordan Lee",
              createdAt: "2026-03-16T10:15:00.000Z",
            },
          ],
        },
      ],
    });
  });

  it("renders hero details, leaderboard, tabs, discussion posts, and fundraiser cards", () => {
    render(
      <PublicCommunityPage
        model={{
          status: "success",
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            description: "A public space for updates and volunteer coordination.",
            visibility: "public",
            followerCount: 12,
            fundraiserCount: 2,
            amountRaised: 18700,
            donationCount: 6,
          },
          owner: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: null,
          },
          featuredFundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            status: "active",
            goalAmount: 250000,
            amountRaised: 12600,
            supporterCount: 3,
            donationCount: 4,
          },
          leaderboard: [
            {
              rank: 1,
              fundraiser: {
                slug: "warm-meals-2026",
                title: "Warm Meals 2026",
                status: "active",
                goalAmount: 250000,
                amountRaised: 12600,
                supporterCount: 3,
                donationCount: 4,
              },
            },
            {
              rank: 2,
              fundraiser: {
                slug: "winter-coat-drive-2026",
                title: "Winter Coat Drive 2026",
                status: "active",
                goalAmount: 180000,
                amountRaised: 8200,
                supporterCount: 2,
                donationCount: 3,
              },
            },
          ],
          fundraisers: [
            {
              slug: "warm-meals-2026",
              title: "Warm Meals 2026",
              status: "active",
              goalAmount: 250000,
              amountRaised: 12600,
              supporterCount: 3,
              donationCount: 4,
            },
            {
              slug: "winter-coat-drive-2026",
              title: "Winter Coat Drive 2026",
              status: "active",
              goalAmount: 180000,
              amountRaised: 8200,
              supporterCount: 2,
              donationCount: 3,
            },
          ],
          discussion: [
            {
              id: "post_123",
              title: "Kitchen kickoff update",
              body: "Our first prep day starts this Saturday.",
              status: "published",
              moderationStatus: "visible",
              authorDisplayName: "Avery Johnson",
              createdAt: "2026-03-16T10:00:00.000Z",
              comments: [
                {
                  id: "comment_123",
                  body: "I can help with setup.",
                  moderationStatus: "visible",
                  authorDisplayName: "Jordan Lee",
                  createdAt: "2026-03-16T10:15:00.000Z",
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Neighbors Helping Neighbors",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("A public space for updates and volunteer coordination.")
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("12 followers"),
    ).toBeInTheDocument();
    for (const ownerLink of screen.getAllByRole("link", {
      name: "View owner profile",
    })) {
      expect(ownerLink).toHaveAttribute("href", "/profiles/avery-johnson");
    }
    expect(
      screen.getByRole("link", { name: "View featured fundraiser" }),
    ).toHaveAttribute("href", "/fundraisers/warm-meals-2026");
    expect(screen.getByText("Top fundraiser momentum")).toBeInTheDocument();
    expect(screen.getByText("$12,600")).toBeInTheDocument();
    expect(screen.getAllByText("Activity").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Fundraisers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("About").length).toBeGreaterThan(0);

    expect(screen.getByText("Community updates")).toBeInTheDocument();
    expect(screen.getByText("Kitchen kickoff update")).toBeInTheDocument();
    expect(screen.getByText("Our first prep day starts this Saturday.")).toBeInTheDocument();
    expect(screen.getByText("I can help with setup.")).toBeInTheDocument();
    expect(screen.getByText("Campaigns in this community")).toBeInTheDocument();
    expect(
      screen
        .getAllByText("Winter Coat Drive 2026")
        .some(
          (element) =>
            element.closest("a")?.getAttribute("href") ===
            "/fundraisers/winter-coat-drive-2026",
        ),
    ).toBe(true);
    expect(screen.getByText("What this community supports")).toBeInTheDocument();
  });

  it("renders community-not-found and invalid-request states", () => {
    const { rerender } = render(
      <PublicCommunityPage
        model={{
          status: "not_found",
          slug: "missing-community",
          message: 'No community was found for slug "missing-community".',
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Community not found" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tried slug:/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View seeded community" }),
    ).toHaveAttribute("href", "/communities/neighbors-helping-neighbors");

    rerender(
      <PublicCommunityPage
        model={{
          status: "invalid_request",
          message: "slug is required.",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Invalid community request" }),
    ).toBeInTheDocument();
    expect(screen.getByText("slug is required.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

const createPublicCommunityQueryStub = ({
  result,
}: {
  result: PublicQueryResult<PublicCommunityResponse>;
}) => ({
  getPublicCommunityBySlug: vi.fn().mockResolvedValue(result),
});
