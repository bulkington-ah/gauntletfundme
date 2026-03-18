import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

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
    Reflect.deleteProperty(window.navigator, "clipboard");
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
    expect(screen.queryByText("←")).not.toBeInTheDocument();
    expect(screen.queryByText("→")).not.toBeInTheDocument();
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
    expect(screen.getAllByRole("button", { name: "Share" })).toHaveLength(3);
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

  it("keeps the supporter rail scrollable while toggling recent, all, and top donations", () => {
    render(
      <PublicFundraiserPage
        model={createSuccessfulPageModel([
          {
            displayName: "Latest Donor",
            profileSlug: "latest-donor",
            avatarUrl: null,
            amount: 100,
            status: "completed",
            createdAt: "2026-03-16T12:55:00.000Z",
          },
          {
            displayName: "Second Donor",
            profileSlug: "second-donor",
            avatarUrl: null,
            amount: 4000,
            status: "completed",
            createdAt: "2026-03-16T12:50:00.000Z",
          },
          {
            displayName: "Third Donor",
            profileSlug: "third-donor",
            avatarUrl: null,
            amount: 200,
            status: "completed",
            createdAt: "2026-03-16T12:45:00.000Z",
          },
          {
            displayName: "Top Donor",
            profileSlug: "top-donor",
            avatarUrl: null,
            amount: 9000,
            status: "completed",
            createdAt: "2026-03-16T12:40:00.000Z",
          },
          {
            displayName: "Fifth Donor",
            profileSlug: "fifth-donor",
            avatarUrl: null,
            amount: 3000,
            status: "completed",
            createdAt: "2026-03-16T12:35:00.000Z",
          },
        ])}
      />,
    );

    const viewport = screen.getByTestId("fundraiser-supporter-viewport");
    const seeAllButton = screen.getByRole("button", { name: "See all" });
    const seeTopButton = screen.getByRole("button", { name: "See top" });

    expect(viewport).toHaveAttribute("role", "region");
    expect(within(viewport).getByRole("list")).toBeInTheDocument();
    expect(within(viewport).getAllByRole("listitem")).toHaveLength(3);
    expect(within(viewport).getByText("Latest Donor")).toBeInTheDocument();
    expect(within(viewport).getByText("Second Donor")).toBeInTheDocument();
    expect(within(viewport).getByText("Third Donor")).toBeInTheDocument();
    expect(within(viewport).queryByText("Top Donor")).not.toBeInTheDocument();
    expect(within(viewport).queryByText("Fifth Donor")).not.toBeInTheDocument();
    expect(seeAllButton).toHaveAttribute("aria-pressed", "false");
    expect(seeTopButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(seeAllButton);

    expect(seeAllButton).toHaveAttribute("aria-pressed", "true");
    expect(seeTopButton).toHaveAttribute("aria-pressed", "false");
    expect(within(viewport).getAllByRole("listitem")).toHaveLength(5);
    expect(within(viewport).getByText("Top Donor")).toBeInTheDocument();
    expect(within(viewport).getByText("Fifth Donor")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Recent supporters" }),
    ).toBeInTheDocument();

    fireEvent.click(seeTopButton);

    expect(seeAllButton).toHaveAttribute("aria-pressed", "false");
    expect(seeTopButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { name: "Top supporters" }),
    ).toBeInTheDocument();

    const sortedItems = within(viewport).getAllByRole("listitem");
    expect(within(sortedItems[0]!).getByText("Top Donor")).toBeInTheDocument();
    expect(within(sortedItems[1]!).getByText("Second Donor")).toBeInTheDocument();
    expect(within(sortedItems[2]!).getByText("Fifth Donor")).toBeInTheDocument();
    expect(within(sortedItems[3]!).getByText("Third Donor")).toBeInTheDocument();
    expect(within(sortedItems[4]!).getByText("Latest Donor")).toBeInTheDocument();
  });

  it("disables supporter rail buttons when there are no public donations", () => {
    render(<PublicFundraiserPage model={createSuccessfulPageModel([])} />);

    expect(screen.getByRole("button", { name: "See all" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "See top" })).toBeDisabled();
    expect(
      within(screen.getByTestId("fundraiser-supporter-viewport")).queryAllByRole(
        "listitem",
      ),
    ).toHaveLength(0);
  });

  it("opens the share modal and copies the canonical fundraiser URL", async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    setClipboardStub({ writeText: writeTextSpy });

    render(<PublicFundraiserPage model={createSuccessfulPageModel([])} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Share" })[0]!);

    const dialog = screen.getByRole("dialog", { name: "Share fundraiser" });
    const shareUrl = `${window.location.origin}/fundraisers/warm-meals-2026`;

    expect(within(dialog).getByLabelText("Fundraiser URL")).toHaveValue(shareUrl);

    fireEvent.click(within(dialog).getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(writeTextSpy).toHaveBeenCalledWith(shareUrl));
    expect(await within(dialog).findByText("Link copied to clipboard.")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Share fundraiser" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows manual copy guidance when clipboard copy fails or is unavailable", async () => {
    const writeTextSpy = vi.fn().mockRejectedValue(new Error("clipboard denied"));
    setClipboardStub({ writeText: writeTextSpy });

    render(<PublicFundraiserPage model={createSuccessfulPageModel([])} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Share" })[0]!);

    let dialog = screen.getByRole("dialog", { name: "Share fundraiser" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Copy link" }));

    expect(
      await within(dialog).findByText("Select the link and copy it manually."),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Share fundraiser" }),
      ).not.toBeInTheDocument(),
    );

    setClipboardStub(undefined);

    fireEvent.click(screen.getAllByRole("button", { name: "Share" })[1]!);

    dialog = screen.getByRole("dialog", { name: "Share fundraiser" });

    expect(
      within(dialog).queryByText("Select the link and copy it manually."),
    ).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Copy link" }));

    expect(
      await within(dialog).findByText("Select the link and copy it manually."),
    ).toBeInTheDocument();
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

const createSuccessfulPageModel = (
  recentDonations: PublicFundraiserResponse["recentDonations"],
) => ({
  status: "success" as const,
  viewerFollowState: {
    isFollowing: false,
    isOwnTarget: false,
  },
  fundraiser: {
    slug: "warm-meals-2026",
    title: "Warm Meals 2026",
    story:
      "We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.",
    status: "active" as const,
    goalAmount: 250000,
    amountRaised: 7800,
    supporterCount: recentDonations.length,
    donationCount: recentDonations.length,
  },
  organizer: {
    displayName: "Avery Johnson",
    role: "organizer" as const,
    profileSlug: "avery-johnson",
    avatarUrl: null,
  },
  community: {
    slug: "neighbors-helping-neighbors",
    name: "Neighbors Helping Neighbors",
    visibility: "public" as const,
  },
  recentDonations,
});

const setClipboardStub = (
  clipboard: {
    writeText: (value: string) => Promise<void>;
  } | undefined,
) => {
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: clipboard,
  });
};
