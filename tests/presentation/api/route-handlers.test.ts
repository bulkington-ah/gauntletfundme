import {
  handleGetPublicCommunityRoute,
  handleGetPublicFundraiserRoute,
  handleGetPublicProfileRoute,
  handlePostFollowTargetRoute,
} from "@/presentation/api";

describe("API route handlers", () => {
  it("returns seeded profile data from the public profile handler", async () => {
    const response = await handleGetPublicProfileRoute(new Request("http://test"), {
      slug: "avery-johnson",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      kind: "profile",
      profile: {
        slug: "avery-johnson",
        displayName: "Avery Johnson",
        followerCount: 1,
      },
      connections: {
        fundraisers: [
          {
            slug: "warm-meals-2026",
          },
        ],
        communities: [
          {
            slug: "neighbors-helping-neighbors",
          },
        ],
      },
    });
  });

  it("returns a 404 for an unknown fundraiser slug", async () => {
    const response = await handleGetPublicFundraiserRoute(new Request("http://test"), {
      slug: "missing-fundraiser",
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      message: 'No fundraiser was found for slug "missing-fundraiser".',
    });
  });

  it("returns community discussion content with nested comments", async () => {
    const response = await handleGetPublicCommunityRoute(
      new Request("http://test"),
      {
        slug: "neighbors-helping-neighbors",
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      kind: "community",
      community: {
        slug: "neighbors-helping-neighbors",
        followerCount: 1,
      },
      discussion: [
        {
          title: "Volunteer reminder",
          comments: [
            {
              body: "Thank you. We will also have extra containers available onsite.",
            },
          ],
        },
        {
          title: "Kitchen kickoff update",
          comments: [
            {
              body: "I can help with prep and delivery on the first shift.",
            },
          ],
        },
      ],
    });
  });

  it("returns unauthorized for follow commands without a demo session header", async () => {
    const response = await handlePostFollowTargetRoute(
      new Request("http://test", {
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

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message:
        "Authentication is required for follow commands. Send the x-demo-session header to exercise this placeholder write path.",
      meta: {
        demoSessionHeader: "x-demo-session",
      },
    });
  });

  it("proves the auth-aware write path after resolving a demo session", async () => {
    const response = await handlePostFollowTargetRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-demo-session": "demo-supporter-session",
        },
        body: JSON.stringify({
          targetType: "community",
          targetSlug: "neighbors-helping-neighbors",
        }),
      }),
    );

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      error: "not_implemented",
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      target: {
        type: "community",
        slug: "neighbors-helping-neighbors",
      },
      meta: {
        demoSessionHeader: "x-demo-session",
      },
    });
  });
});
