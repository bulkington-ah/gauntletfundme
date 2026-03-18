import { render, screen } from "@testing-library/react";

import type { PublicFundraiserListResponse } from "@/application";
import {
  PublicFundraiserBrowsePage,
  buildPublicFundraiserBrowsePageModel,
} from "@/presentation/fundraisers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("PublicFundraiserBrowsePage", () => {
  it("builds a browse page model from the public fundraiser list query", async () => {
    const query = createPublicFundraiserListQueryStub({
      result: {
        kind: "fundraiser_list",
        fundraisers: [
          {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            status: "active",
            goalAmount: 250000,
            amountRaised: 22000,
            supporterCount: 5,
            donationCount: 5,
            storyExcerpt: "Funding weekly hot meal deliveries and pantry restocks.",
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
          },
        ],
      },
    });

    const model = await buildPublicFundraiserBrowsePageModel({
      publicFundraiserQuery: query,
    });

    expect(query.listPublicFundraisers).toHaveBeenCalledTimes(1);
    expect(model).toEqual({
      status: "success",
      fundraisers: [
        {
          slug: "warm-meals-2026",
          title: "Warm Meals 2026",
          status: "active",
          goalAmount: 250000,
          amountRaised: 22000,
          supporterCount: 5,
          donationCount: 5,
          storyExcerpt: "Funding weekly hot meal deliveries and pantry restocks.",
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
        },
      ],
    });
  });

  it("renders fundraiser browse cards that link to the public fundraiser pages", () => {
    render(
      <PublicFundraiserBrowsePage
        model={{
          status: "success",
          fundraisers: [
            {
              slug: "warm-meals-2026",
              title: "Warm Meals 2026",
              status: "active",
              goalAmount: 250000,
              amountRaised: 22000,
              supporterCount: 5,
              donationCount: 5,
              storyExcerpt:
                "Funding weekly hot meal deliveries and pantry restocks for families across the neighborhood.",
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
            },
            {
              slug: "winter-coat-drive-2026",
              title: "Winter Coat Drive 2026",
              status: "active",
              goalAmount: 180000,
              amountRaised: 8000,
              supporterCount: 2,
              donationCount: 2,
              storyExcerpt:
                "Funding new coats, gloves, and cold-weather gear for neighbors preparing for severe weather.",
              organizer: {
                displayName: "Avery Johnson",
                role: "organizer",
                profileSlug: "avery-johnson",
                avatarUrl: null,
              },
              community: {
                slug: "weekend-pantry-crew",
                name: "Weekend Pantry Crew",
                visibility: "public",
              },
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Find public fundraisers with real momentum" }),
    ).toBeInTheDocument();
    expect(screen.getByText("public fundraisers")).toBeInTheDocument();
    expect(screen.getByText("active campaigns")).toBeInTheDocument();

    const warmMealsCard = screen.getByRole("link", { name: "Warm Meals 2026" });
    const winterCoatCard = screen.getByRole("link", {
      name: "Winter Coat Drive 2026",
    });

    expect(warmMealsCard).toHaveAttribute("href", "/fundraisers/warm-meals-2026");
    expect(winterCoatCard).toHaveAttribute(
      "href",
      "/fundraisers/winter-coat-drive-2026",
    );
    expect(screen.getAllByRole("link", { name: "Avery Johnson" })).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Open fundraiser Warm Meals 2026" }),
    ).toHaveAttribute("href", "/fundraisers/warm-meals-2026");
    expect(screen.getByText("Weekend Pantry Crew")).toBeInTheDocument();
  });

  it("links the create CTA through login for anonymous visitors", () => {
    render(
      <PublicFundraiserBrowsePage
        model={{
          status: "success",
          fundraisers: [],
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Start a fundraiser" }),
    ).toHaveAttribute("href", "/login?next=%2Ffundraisers%2Fcreate");
  });

  it("links the create CTA directly for authenticated viewers", () => {
    render(
      <PublicFundraiserBrowsePage
        model={{
          status: "success",
          fundraisers: [],
        }}
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Start a fundraiser" }),
    ).toHaveAttribute("href", "/fundraisers/create");
  });
});

const createPublicFundraiserListQueryStub = ({
  result,
}: {
  result: PublicFundraiserListResponse;
}) => ({
  listPublicFundraisers: vi.fn().mockResolvedValue(result),
});
