import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type { PublicFundraiserResponse, PublicQueryResult } from "@/application";
import {
  PublicFundraiserPage,
  buildPublicFundraiserPageModel,
} from "@/presentation/fundraisers";

const { refreshSpy } = vi.hoisted(() => ({
  refreshSpy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: refreshSpy,
  }),
}));

describe("PublicFundraiserPage", () => {
  afterEach(() => {
    refreshSpy.mockReset();
    vi.unstubAllGlobals();
  });

  it("builds a success page model from the public fundraiser query", async () => {
    const query = createPublicFundraiserQueryStub({
      result: {
        status: "success",
        data: {
          kind: "fundraiser",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: false,
          },
          fundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            story:
              "We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.",
            status: "active",
            goalAmount: 250000,
            amountRaised: 7800,
            supporterCount: 2,
            donationCount: 2,
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
          recentDonations: [
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
      viewerUserId: null,
    });
    expect(model).toEqual({
      status: "success",
      viewerFollowState: {
        isFollowing: false,
        isOwnTarget: false,
      },
      fundraiser: {
        slug: "warm-meals-2026",
        title: "Warm Meals 2026",
        story:
          "We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.",
        status: "active",
        goalAmount: 250000,
        amountRaised: 7800,
        supporterCount: 2,
        donationCount: 2,
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
      recentDonations: [
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

  it("renders fundraiser media, story, organizer context, supporter rail, and donation controls", () => {
    render(
      <PublicFundraiserPage
        model={{
          status: "success",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: false,
          },
          fundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            story:
              "We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.",
            status: "active",
            goalAmount: 250000,
            amountRaised: 7800,
            supporterCount: 2,
            donationCount: 2,
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
          recentDonations: [
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
              status: "completed",
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
      screen.getByText(
        "We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /A focused public fundraiser experience built for clarity, momentum, and community trust\./,
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Every donation helps/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Payment processing stays mocked in v1/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Warm meal deliveries staged for neighborhood pickup",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recent supporters"),
    ).toBeInTheDocument();
    expect(screen.getByText("Noah Kim")).toBeInTheDocument();
    expect(screen.getByText("Sam Rivera")).toBeInTheDocument();
    expect(screen.getAllByText("$7,800 raised")).toHaveLength(2);
    expect(screen.getAllByText("3% of goal")).toHaveLength(2);
    expect(screen.getAllByText("$4,000 donated")).toHaveLength(1);
    expect(screen.getAllByText("$3,800 donated")).toHaveLength(1);

    const donateButtons = screen.getAllByRole("button", { name: "Donate now" });
    expect(donateButtons).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "Follow" })).toHaveLength(2);

    expect(
      screen
        .getAllByRole("link", { name: "Avery Johnson" })
        .some((link) => link.getAttribute("href") === "/profiles/avery-johnson"),
    ).toBe(true);
    expect(screen.getByRole("link", { name: /Noah Kim/i })).toHaveAttribute(
      "href",
      "/profiles/noah-kim",
    );
    expect(screen.getByRole("link", { name: /Sam Rivera/i })).toHaveAttribute(
      "href",
      "/profiles/sam-rivera",
    );

    const communityLink = screen.getByRole("link", {
      name: "Neighbors Helping Neighbors",
    });
    expect(communityLink).toHaveAttribute(
      "href",
      "/communities/neighbors-helping-neighbors",
    );
  });

  it("reveals the donation form from the shared CTA and submits a persisted donation", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          donation: {
            amount: 250,
          },
        }),
        {
          status: 201,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <PublicFundraiserPage
        model={{
          status: "success",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: false,
          },
          fundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            story:
              "We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.",
            status: "active",
            goalAmount: 250000,
            amountRaised: 7800,
            supporterCount: 2,
            donationCount: 2,
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
          recentDonations: [],
        }}
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Donate now" })[1]!);

    const amountInput = screen.getAllByLabelText("Donation amount (USD)")[0]!;
    fireEvent.change(amountInput, { target: { value: "250" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Submit donation" })[0]!);

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith("/api/engagement/donations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fundraiserSlug: "warm-meals-2026",
          amount: 250,
        }),
      }),
    );
    expect(
      await screen.findByText("$250 donated. Totals are refreshing now."),
    ).toBeInTheDocument();
    await waitFor(() => expect(refreshSpy).toHaveBeenCalledTimes(1));
  });

  it("hides fundraiser follow controls on a self-owned fundraiser page", () => {
    render(
      <PublicFundraiserPage
        model={{
          status: "success",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: true,
          },
          fundraiser: {
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            story:
              "We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.",
            status: "active",
            goalAmount: 250000,
            amountRaised: 7800,
            supporterCount: 2,
            donationCount: 2,
          },
          organizer: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: null,
          },
          community: null,
          recentDonations: [],
        }}
        viewer={{
          userId: "user_organizer_avery",
          role: "organizer",
        }}
      />,
    );

    expect(screen.getAllByRole("button", { name: "Donate now" })).toHaveLength(3);
    expect(
      screen.queryByRole("button", { name: "Follow" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Unfollow" }),
    ).not.toBeInTheDocument();
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
      screen.getByRole("link", { name: "Browse fundraisers" }),
    ).toHaveAttribute("href", "/fundraisers");

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
