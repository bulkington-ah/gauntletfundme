import { render, screen } from "@testing-library/react";

import type { PublicFundraiserResponse, PublicQueryResult } from "@/application";
import {
  PublicFundraiserPage,
  buildPublicFundraiserPageModel,
} from "@/presentation/fundraisers";

describe("PublicFundraiserPage", () => {
  it("builds a success page model from the public fundraiser query", async () => {
    const query = createPublicFundraiserQueryStub({
      result: {
        status: "success",
        data: {
          kind: "fundraiser",
          fundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            story: "Funding hot meals for families all winter.",
            status: "active",
            goalAmount: 250000,
            supportAmount: 7800,
            supporterCount: 2,
            donationIntentCount: 2,
          },
          organizer: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: null,
          },
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
          },
          recentSupporters: [
            {
              displayName: "Noah Kim",
              profileSlug: "noah-kim",
              avatarUrl: null,
              amount: 4000,
              status: "completed",
              createdAt: "2026-03-16T12:55:00.000Z",
            },
          ],
        },
      },
    });

    const model = await buildPublicFundraiserPageModel(
      {
        publicFundraiserQuery: query,
      },
      "warm-meals-2026",
    );

    expect(query.getPublicFundraiserBySlug).toHaveBeenCalledWith({
      slug: "warm-meals-2026",
    });
    expect(model).toEqual({
      status: "success",
      fundraiser: {
        slug: "warm-meals-2026",
        title: "Warm Meals 2026",
        story: "Funding hot meals for families all winter.",
        status: "active",
        goalAmount: 250000,
        supportAmount: 7800,
        supporterCount: 2,
        donationIntentCount: 2,
      },
      organizer: {
        displayName: "Avery Johnson",
        role: "organizer",
        profileSlug: "avery-johnson",
        avatarUrl: null,
      },
      community: {
        slug: "neighbors-helping-neighbors",
        name: "Neighbors Helping Neighbors",
        visibility: "public",
      },
      recentSupporters: [
        {
          displayName: "Noah Kim",
          profileSlug: "noah-kim",
          avatarUrl: null,
          amount: 4000,
          status: "completed",
          createdAt: "2026-03-16T12:55:00.000Z",
        },
      ],
    });
  });

  it("renders fundraiser media, story, organizer context, supporter rail, and mocked donation CTA", () => {
    render(
      <PublicFundraiserPage
        model={{
          status: "success",
          fundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            story: "Funding hot meals for families all winter.",
            status: "active",
            goalAmount: 250000,
            supportAmount: 7800,
            supporterCount: 2,
            donationIntentCount: 2,
          },
          organizer: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: null,
          },
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
          },
          recentSupporters: [
            {
              displayName: "Noah Kim",
              profileSlug: "noah-kim",
              avatarUrl: null,
              amount: 4000,
              status: "completed",
              createdAt: "2026-03-16T12:55:00.000Z",
            },
            {
              displayName: "Sam Rivera",
              profileSlug: "sam-rivera",
              avatarUrl: null,
              amount: 3800,
              status: "started",
              createdAt: "2026-03-16T12:40:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Warm Meals 2026" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Funding hot meals for families all winter."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Warm meal deliveries staged for neighborhood pickup",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Avery Johnson" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recent supporters"),
    ).toBeInTheDocument();
    expect(screen.getByText("Noah Kim")).toBeInTheDocument();
    expect(screen.getByText("Sam Rivera")).toBeInTheDocument();
    expect(
      screen.getAllByText("$7,800 in prototype support"),
    ).toHaveLength(2);
    expect(screen.getAllByText("3% of goal")).toHaveLength(2);

    const donateLink = screen.getAllByRole("link", { name: "Donate now" })[0];
    expect(donateLink).toHaveAttribute(
      "href",
      "/fundraisers/warm-meals-2026?checkout=mock",
    );

    const organizerProfileLink = screen.getByRole("link", {
      name: "Avery Johnson",
    });
    expect(organizerProfileLink).toHaveAttribute("href", "/profiles/avery-johnson");

    const communityLink = screen.getByRole("link", {
      name: "Neighbors Helping Neighbors",
    });
    expect(communityLink).toHaveAttribute(
      "href",
      "/communities/neighbors-helping-neighbors",
    );
  });

  it("renders fundraiser-not-found and invalid-request states", () => {
    const { rerender } = render(
      <PublicFundraiserPage
        model={{
          status: "not_found",
          slug: "missing-fundraiser",
          message: 'No fundraiser was found for slug "missing-fundraiser".',
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Fundraiser not found" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tried slug:/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View seeded fundraiser" }),
    ).toHaveAttribute("href", "/fundraisers/warm-meals-2026");

    rerender(
      <PublicFundraiserPage
        model={{
          status: "invalid_request",
          message: "slug is required.",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Invalid fundraiser request" }),
    ).toBeInTheDocument();
    expect(screen.getByText("slug is required.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

const createPublicFundraiserQueryStub = ({
  result,
}: {
  result: PublicQueryResult<PublicFundraiserResponse>;
}) => ({
  getPublicFundraiserBySlug: vi.fn().mockResolvedValue(result),
});
