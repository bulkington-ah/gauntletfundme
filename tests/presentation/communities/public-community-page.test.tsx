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
          },
          owner: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
          },
          featuredFundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            status: "active",
            goalAmount: 250000,
          },
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
      },
      owner: {
        displayName: "Avery Johnson",
        role: "organizer",
        profileSlug: "avery-johnson",
      },
      featuredFundraiser: {
        slug: "warm-meals-2026",
        title: "Warm Meals 2026",
        status: "active",
        goalAmount: 250000,
      },
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

  it("renders community details, discussion posts, and nested comments", () => {
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
          },
          owner: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
          },
          featuredFundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            status: "active",
            goalAmount: 250000,
          },
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
      screen.getByRole("heading", { name: "Neighbors Helping Neighbors" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A public space for updates and volunteer coordination."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Avery Johnson · Organizer"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View owner profile" }),
    ).toHaveAttribute("href", "/profiles/avery-johnson");
    expect(
      screen.getByRole("link", { name: "Warm Meals 2026" }),
    ).toHaveAttribute("href", "/fundraisers/warm-meals-2026");
    expect(screen.getAllByText("Start a GoFundMe")[0]).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Discussion feed" })).toBeInTheDocument();
    expect(screen.getByText("Kitchen kickoff update")).toBeInTheDocument();
    expect(screen.getByText("Our first prep day starts this Saturday.")).toBeInTheDocument();
    expect(screen.getByText("I can help with setup.")).toBeInTheDocument();
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
    expect(screen.getAllByText("Start a GoFundMe")[0]).toBeInTheDocument();

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
    expect(screen.getAllByText("Start a GoFundMe")[0]).toBeInTheDocument();
  });
});

const createPublicCommunityQueryStub = ({
  result,
}: {
  result: PublicQueryResult<PublicCommunityResponse>;
}) => ({
  getPublicCommunityBySlug: vi.fn().mockResolvedValue(result),
});
