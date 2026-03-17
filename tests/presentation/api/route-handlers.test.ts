import { createApplicationApi } from "@/application";
import { createStaticSessionViewerGateway } from "@/infrastructure/auth";
import { createStaticPublicContentRepository } from "@/infrastructure/public-content";
import {
  handleGetPublicCommunityRoute,
  handleGetPublicFundraiserRoute,
  handleGetPublicProfileRoute,
  handlePostFollowTargetRoute,
  handlePostUnfollowTargetRoute,
  setApplicationApiForTesting,
} from "@/presentation/api";

describe("API route handlers", () => {
  beforeEach(() => {
    const staticRepository = createStaticPublicContentRepository();

    setApplicationApiForTesting(
      createApplicationApi({
        publicContentReadRepository: staticRepository,
        followTargetLookup: staticRepository,
        sessionViewerGateway: createStaticSessionViewerGateway(),
        followOwnerLookup: {
          async findOwnerUserIdByTarget() {
            return "user_organizer_avery";
          },
        },
        followWriteRepository: {
          async createFollowIfAbsent() {
            return {
              follow: {
                id: "follow_created_test",
                userId: "user_supporter_jordan",
                targetType: "community",
                targetId: "community_neighbors_helping_neighbors",
                createdAt: new Date("2026-03-16T13:00:00.000Z"),
              },
              created: true,
            };
          },
          async removeFollowIfPresent() {
            return {
              removed: true,
            };
          },
          async countFollowersForTarget() {
            return 2;
          },
        },
      }),
    );
  });

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

  it("returns unauthorized for follow commands without a session token header", async () => {
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
        "Authentication is required for follow commands. Send the x-session-token header to continue.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 201 for a newly created follow after resolving a session", async () => {
    const response = await handlePostFollowTargetRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-supporter-session",
        },
        body: JSON.stringify({
          targetType: "community",
          targetSlug: "neighbors-helping-neighbors",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      target: {
        type: "community",
        slug: "neighbors-helping-neighbors",
      },
      follow: {
        id: "follow_created_test",
        created: true,
        followerCount: 2,
        following: true,
      },
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 200 when the follow already exists", async () => {
    const staticRepository = createStaticPublicContentRepository();
    setApplicationApiForTesting(
      createApplicationApi({
        publicContentReadRepository: staticRepository,
        followTargetLookup: staticRepository,
        sessionViewerGateway: createStaticSessionViewerGateway(),
        followOwnerLookup: {
          async findOwnerUserIdByTarget() {
            return "user_organizer_avery";
          },
        },
        followWriteRepository: {
          async createFollowIfAbsent() {
            return {
              follow: {
                id: "follow_existing_test",
                userId: "user_supporter_jordan",
                targetType: "community",
                targetId: "community_neighbors_helping_neighbors",
                createdAt: new Date("2026-03-16T13:00:00.000Z"),
              },
              created: false,
            };
          },
          async removeFollowIfPresent() {
            return {
              removed: true,
            };
          },
          async countFollowersForTarget() {
            return 2;
          },
        },
      }),
    );

    const response = await handlePostFollowTargetRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-supporter-session",
        },
        body: JSON.stringify({
          targetType: "community",
          targetSlug: "neighbors-helping-neighbors",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      follow: {
        id: "follow_existing_test",
        created: false,
        followerCount: 2,
        following: true,
      },
    });
  });

  it("returns 403 when attempting to follow a self-owned target", async () => {
    const staticRepository = createStaticPublicContentRepository();
    setApplicationApiForTesting(
      createApplicationApi({
        publicContentReadRepository: staticRepository,
        followTargetLookup: staticRepository,
        sessionViewerGateway: createStaticSessionViewerGateway(),
        followOwnerLookup: {
          async findOwnerUserIdByTarget() {
            return "user_supporter_jordan";
          },
        },
        followWriteRepository: {
          async createFollowIfAbsent() {
            return {
              follow: {
                id: "follow_not_expected",
                userId: "user_supporter_jordan",
                targetType: "community",
                targetId: "community_neighbors_helping_neighbors",
                createdAt: new Date("2026-03-16T13:00:00.000Z"),
              },
              created: true,
            };
          },
          async removeFollowIfPresent() {
            return {
              removed: true,
            };
          },
          async countFollowersForTarget() {
            return 2;
          },
        },
      }),
    );

    const response = await handlePostFollowTargetRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-supporter-session",
        },
        body: JSON.stringify({
          targetType: "community",
          targetSlug: "neighbors-helping-neighbors",
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "forbidden",
      message: "You cannot follow your own profile, fundraiser, or community.",
    });
  });

  it("returns unauthorized for unfollow commands without a session token header", async () => {
    const response = await handlePostUnfollowTargetRoute(
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
        "Authentication is required for follow commands. Send the x-session-token header to continue.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 200 for an unfollow command after resolving a session", async () => {
    const response = await handlePostUnfollowTargetRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-supporter-session",
        },
        body: JSON.stringify({
          targetType: "community",
          targetSlug: "neighbors-helping-neighbors",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      target: {
        type: "community",
        slug: "neighbors-helping-neighbors",
      },
      follow: {
        removed: true,
        followerCount: 2,
        following: false,
      },
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });
});
