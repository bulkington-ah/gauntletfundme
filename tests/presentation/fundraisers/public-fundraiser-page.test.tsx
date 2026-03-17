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
            donationIntentCount: 2,
          },
          organizer: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
          },
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
          },
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
        donationIntentCount: 2,
      },
      organizer: {
        displayName: "Avery Johnson",
        role: "organizer",
        profileSlug: "avery-johnson",
      },
      community: {
        slug: "neighbors-helping-neighbors",
        name: "Neighbors Helping Neighbors",
        visibility: "public",
      },
    });
  });

  it("renders fundraiser story, organizer context, connected community, and mocked donation CTA", () => {
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
            donationIntentCount: 2,
          },
          organizer: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
          },
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
          },
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
      screen.getByText("Avery Johnson · Organizer"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mock donation intents started:"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This CTA is intentionally mocked and does not collect payment details.",
      ),
    ).toBeInTheDocument();

    const donateLink = screen.getByRole("link", { name: "Start mocked donation" });
    expect(donateLink).toHaveAttribute(
      "href",
      "/fundraisers/warm-meals-2026?checkout=mock",
    );

    const organizerProfileLink = screen.getByRole("link", {
      name: "View organizer profile",
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
  });
});

const createPublicFundraiserQueryStub = ({
  result,
}: {
  result: PublicQueryResult<PublicFundraiserResponse>;
}) => ({
  getPublicFundraiserBySlug: vi.fn().mockResolvedValue(result),
});
