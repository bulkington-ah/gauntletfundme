import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FollowTargetControl } from "@/presentation/engagement";

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

describe("FollowTargetControl", () => {
  afterEach(() => {
    pushSpy.mockReset();
    refreshSpy.mockReset();
    vi.unstubAllGlobals();
  });

  it("redirects anonymous viewers to login when follow is clicked", () => {
    render(
      <FollowTargetControl
        buttonClassName="followButton"
        initialFollowState={null}
        nextPath="/profiles/avery-johnson"
        targetSlug="avery-johnson"
        targetType="profile"
        viewer={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Follow" }));

    expect(pushSpy).toHaveBeenCalledWith(
      "/login?next=%2Fprofiles%2Favery-johnson",
    );
  });

  it("posts to the follow endpoint and refreshes on success", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          follow: {
            following: true,
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
      <FollowTargetControl
        buttonClassName="followButton"
        initialFollowState={{
          isFollowing: false,
          isOwnTarget: false,
        }}
        nextPath="/communities/neighbors-helping-neighbors"
        targetSlug="neighbors-helping-neighbors"
        targetType="community"
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith("/api/engagement/follows", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          targetType: "community",
          targetSlug: "neighbors-helping-neighbors",
        }),
      }),
    );
    expect(await screen.findByRole("button", { name: "Unfollow" })).toBeInTheDocument();
    await waitFor(() => expect(refreshSpy).toHaveBeenCalledTimes(1));
  });

  it("posts to the unfollow endpoint and refreshes on success", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          follow: {
            following: false,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <FollowTargetControl
        buttonClassName="followButton"
        initialFollowState={{
          isFollowing: true,
          isOwnTarget: false,
        }}
        nextPath="/profiles/avery-johnson"
        targetSlug="avery-johnson"
        targetType="profile"
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Unfollow" }));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith("/api/engagement/unfollows", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          targetType: "profile",
          targetSlug: "avery-johnson",
        }),
      }),
    );
    expect(await screen.findByRole("button", { name: "Follow" })).toBeInTheDocument();
    await waitFor(() => expect(refreshSpy).toHaveBeenCalledTimes(1));
  });

  it("shows inline API errors without toggling follow state", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "You cannot follow your own profile, fundraiser, or community.",
        }),
        {
          status: 403,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <FollowTargetControl
        buttonClassName="followButton"
        initialFollowState={{
          isFollowing: false,
          isOwnTarget: false,
        }}
        nextPath="/profiles/avery-johnson"
        targetSlug="avery-johnson"
        targetType="profile"
        viewer={{
          userId: "user_supporter_jordan",
          role: "supporter",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Follow" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "You cannot follow your own profile, fundraiser, or community.",
    );
    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
    expect(refreshSpy).not.toHaveBeenCalled();
  });
});
