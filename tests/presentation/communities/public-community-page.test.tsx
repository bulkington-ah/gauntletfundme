import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import type { PublicCommunityResponse, PublicQueryResult } from "@/application";
import {
  PublicCommunityPage,
  type PublicCommunityPageModel,
  buildPublicCommunityPageModel,
} from "@/presentation/communities";

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

describe("PublicCommunityPage", () => {
  afterEach(() => {
    pushSpy.mockReset();
    refreshSpy.mockReset();
    vi.unstubAllGlobals();
  });

  it("builds a success page model from the public community query", async () => {
    const query = createPublicCommunityQueryStub({
      result: {
        status: "success",
        data: {
          kind: "community",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: false,
          },
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
              authorProfileSlug: "avery-johnson",
              createdAt: "2026-03-16T10:00:00.000Z",
              comments: [
                {
                  id: "comment_123",
                  body: "I can help with setup.",
                  moderationStatus: "visible",
                  authorDisplayName: "Jordan Lee",
                  authorProfileSlug: "jordan-lee",
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
      viewerUserId: null,
    });
    expect(model).toEqual({
      status: "success",
      viewerFollowState: {
        isFollowing: false,
        isOwnTarget: false,
      },
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
          authorProfileSlug: "avery-johnson",
          createdAt: "2026-03-16T10:00:00.000Z",
          comments: [
            {
              id: "comment_123",
              body: "I can help with setup.",
              moderationStatus: "visible",
              authorDisplayName: "Jordan Lee",
              authorProfileSlug: "jordan-lee",
              createdAt: "2026-03-16T10:15:00.000Z",
            },
          ],
        },
      ],
    });
  });

  it("renders hero details, leaderboard, tabs, discussion posts, and fundraiser cards", () => {
    const model = createSuccessModel();

    render(
      <PublicCommunityPage
        model={model}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Neighbors Helping Neighbors",
      }),
    ).toBeInTheDocument();
    const heroSection = screen
      .getByRole("heading", {
        level: 1,
        name: "Neighbors Helping Neighbors",
      })
      .closest("section");
    expect(heroSection).not.toBeNull();
    expect(
      within(heroSection as HTMLElement).getAllByText(
        "A public space for updates and volunteer coordination.",
      ),
    ).toHaveLength(1);
    expect(screen.queryByText("Community spotlight")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Coordination, updates, and fundraising all in one public surface.",
      ),
    ).not.toBeInTheDocument();
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
    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
    expect(screen.getByText("Top fundraiser momentum")).toBeInTheDocument();
    expect(screen.getByText("$12,600")).toBeInTheDocument();
    expect(screen.getAllByText("Activity").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Fundraisers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("About").length).toBeGreaterThan(0);

    expect(screen.getByText("Community updates")).toBeInTheDocument();
    expect(screen.queryByText(/Sorting by:/i)).not.toBeInTheDocument();
    const latestHeading = screen.getByRole("heading", {
      level: 3,
      name: "Volunteer reminder",
    });
    const olderHeading = screen.getByRole("heading", {
      level: 3,
      name: "Kitchen kickoff update",
    });
    expect(
      latestHeading.compareDocumentPosition(olderHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(screen.getByText("Volunteer reminder")).toBeInTheDocument();
    expect(screen.getByText("Kitchen kickoff update")).toBeInTheDocument();
    expect(screen.getByText("Our first prep day starts this Saturday.")).toBeInTheDocument();
    expect(screen.getByText("I can help with setup.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Avery Johnson\s+Mar 16, 2026/i }),
    ).toHaveAttribute("href", "/profiles/avery-johnson");
    expect(screen.getByRole("link", { name: "Jordan Lee" })).toHaveAttribute(
      "href",
      "/profiles/jordan-lee",
    );
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
    expect(
      screen.getByRole("link", { name: /Avery Johnson\s+Organizer/i }),
    ).toHaveAttribute("href", "/profiles/avery-johnson");
  });

  it("shows the update composer only for authorized publishers", () => {
    const { rerender } = render(
      <PublicCommunityPage
        model={{
          ...createSuccessModel(),
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: true,
          },
        }}
        viewer={{
          userId: "user_organizer_avery",
          role: "organizer",
        }}
      />,
    );

    expect(screen.getByLabelText("Update title")).toBeInTheDocument();

    rerender(
      <PublicCommunityPage
        model={{
          ...createSuccessModel(),
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: false,
          },
        }}
        viewer={{
          userId: "user_moderator_maya",
          role: "moderator",
        }}
      />,
    );

    expect(screen.getByLabelText("Update title")).toBeInTheDocument();

    rerender(
      <PublicCommunityPage
        model={{
          ...createSuccessModel(),
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: false,
          },
        }}
        viewer={{
          userId: "user_admin_lee",
          role: "admin",
        }}
      />,
    );

    expect(screen.getByLabelText("Update title")).toBeInTheDocument();

    rerender(
      <PublicCommunityPage
        model={createSuccessModel()}
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    expect(screen.queryByLabelText("Update title")).not.toBeInTheDocument();
  });

  it("submits a new community update and refreshes the route", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          post: {
            id: "post_new",
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
      <PublicCommunityPage
        model={{
          ...createSuccessModel(),
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: true,
          },
        }}
        returnTo="/communities/neighbors-helping-neighbors"
        viewer={{
          userId: "user_organizer_avery",
          role: "organizer",
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Update title"), {
      target: { value: "Supply pickup reminder" },
    });
    fireEvent.change(screen.getByLabelText("Update details"), {
      target: { value: "Please stack donated boxes near the front entrance." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post update" }));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith("/api/discussion/posts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          communitySlug: "neighbors-helping-neighbors",
          title: "Supply pickup reminder",
          body: "Please stack donated boxes near the front entrance.",
        }),
      }),
    );

    expect(
      await screen.findByText("Update posted. Refreshing activity."),
    ).toBeInTheDocument();
    await waitFor(() => expect(refreshSpy).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText("Update title")).toHaveValue("");
    expect(screen.getByLabelText("Update details")).toHaveValue("");
  });

  it("submits a comment and refreshes the route for authenticated viewers", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          comment: {
            id: "comment_new",
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
      <PublicCommunityPage
        model={createSuccessModel()}
        returnTo="/communities/neighbors-helping-neighbors"
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    fireEvent.change(screen.getAllByLabelText("Add a comment")[0]!, {
      target: { value: "Count me in for Friday setup." },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Add comment" })[0]!);

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith("/api/discussion/comments", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          postId: "post_volunteer_reminder",
          body: "Count me in for Friday setup.",
        }),
      }),
    );

    expect(
      await screen.findByText("Comment posted. Refreshing activity."),
    ).toBeInTheDocument();
    await waitFor(() => expect(refreshSpy).toHaveBeenCalledTimes(1));
    expect(screen.getAllByLabelText("Add a comment")[0]).toHaveValue("");
  });

  it("shows sign-in prompts instead of active comment forms for anonymous viewers", () => {
    render(<PublicCommunityPage model={createSuccessModel()} />);

    expect(screen.getAllByRole("link", { name: "Sign in to comment" })).toHaveLength(
      2,
    );
    expect(
      screen.queryByRole("button", { name: "Add comment" }),
    ).not.toBeInTheDocument();
  });

  it("renders inline error messages when update and comment submissions fail", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: "Update failed.",
          }),
          {
            status: 400,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: "Comment failed.",
          }),
          {
            status: 400,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      );
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <PublicCommunityPage
        model={{
          ...createSuccessModel(),
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: true,
          },
        }}
        viewer={{
          userId: "user_organizer_avery",
          role: "organizer",
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Update title"), {
      target: { value: "Route reminder" },
    });
    fireEvent.change(screen.getByLabelText("Update details"), {
      target: { value: "Bring insulated bags for delivery." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post update" }));

    expect(await screen.findByText("Update failed.")).toBeInTheDocument();

    fireEvent.change(screen.getAllByLabelText("Add a comment")[0]!, {
      target: { value: "I can help." },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Add comment" })[0]!);

    expect(await screen.findByText("Comment failed.")).toBeInTheDocument();
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
      screen.getByRole("link", { name: "Browse communities" }),
    ).toHaveAttribute("href", "/communities");

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

  it("hides the follow control on a self-owned community page", () => {
    render(
      <PublicCommunityPage
        model={{
          status: "success",
          viewerFollowState: {
            isFollowing: false,
            isOwnTarget: true,
          },
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
          featuredFundraiser: null,
          leaderboard: [],
          fundraisers: [],
          discussion: [],
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

const createPublicCommunityQueryStub = ({
  result,
}: {
  result: PublicQueryResult<PublicCommunityResponse>;
}) => ({
  getPublicCommunityBySlug: vi.fn().mockResolvedValue(result),
});

const createSuccessModel = (): Extract<PublicCommunityPageModel, { status: "success" }> => ({
  status: "success",
  viewerFollowState: {
    isFollowing: false,
    isOwnTarget: false,
  },
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
      id: "post_volunteer_reminder",
      title: "Volunteer reminder",
      body: "Please bring reusable containers if you are joining the pantry packing shift.",
      status: "published",
      moderationStatus: "visible",
      authorDisplayName: "Jordan Lee",
      authorProfileSlug: "jordan-lee",
      createdAt: "2026-03-16T12:00:00.000Z",
      comments: [],
    },
    {
      id: "post_123",
      title: "Kitchen kickoff update",
      body: "Our first prep day starts this Saturday.",
      status: "published",
      moderationStatus: "visible",
      authorDisplayName: "Avery Johnson",
      authorProfileSlug: "avery-johnson",
      createdAt: "2026-03-16T10:00:00.000Z",
      comments: [
        {
          id: "comment_123",
          body: "I can help with setup.",
          moderationStatus: "visible",
          authorDisplayName: "Jordan Lee",
          authorProfileSlug: "jordan-lee",
          createdAt: "2026-03-16T10:15:00.000Z",
        },
      ],
    },
  ],
});
