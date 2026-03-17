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
      recentActivity: [],
    });
  });

  it("renders profile counters, highlight links, connected communities, and recent activity", () => {
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
              {
                slug: "winter-coat-drive-2026",
                title: "Winter Coat Drive 2026",
                status: "active",
                goalAmount: 180000,
                supportAmount: 8000,
                supporterCount: 3,
                donationIntentCount: 3,
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
              type: "fundraiser_support",
              actor: {
                displayName: "Jordan Lee",
                profileSlug: "jordan-lee",
                avatarUrl: null,
              },
              createdAt: "2026-03-16T12:00:00.000Z",
              summary: "Jordan Lee started a mocked donation",
              detail: "Warm Meals 2026",
              fundraiser: {
                slug: "warm-meals-2026",
                title: "Warm Meals 2026",
                status: "active",
                goalAmount: 250000,
                supportAmount: 22000,
                supporterCount: 5,
                donationIntentCount: 5,
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
      screen.getByText((_, element) => element?.textContent === "8 followers"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "2 following"),
    ).toBeInTheDocument();
    expect(screen.getByText("Fundraiser momentum")).toBeInTheDocument();
    expect(screen.getByText("Recent public activity")).toBeInTheDocument();
    expect(screen.getAllByText("Start a GoFundMe")[0]).toBeInTheDocument();

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
    expect(screen.getByText("Jordan Lee started a mocked donation")).toBeInTheDocument();
    expect(screen.getByText("$4,200 toward a fundraiser")).toBeInTheDocument();
    expect(screen.getByText("Kitchen kickoff update")).toBeInTheDocument();
    expect(screen.getByText("Meal prep starts Saturday.")).toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: "Back home" })).toHaveAttribute(
      "href",
      "/",
    );
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
