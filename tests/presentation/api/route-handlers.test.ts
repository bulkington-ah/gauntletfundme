import { createApplicationApi } from "@/application";
import { createStaticSessionViewerGateway } from "@/infrastructure/auth";
import { createStaticPublicContentRepository } from "@/infrastructure/public-content";
import { browserSessionCookieName } from "@/presentation/auth";
import {
  handleGetPublicCommunityRoute,
  handleGetPublicFundraiserRoute,
  handleGetPublicProfileRoute,
  handlePostCreateCommentRoute,
  handlePostCreatePostRoute,
  handlePostFollowTargetRoute,
  handlePostResolveReportRoute,
  handlePostSubmitDonationRoute,
  handlePostSubmitReportRoute,
  handlePostUnfollowTargetRoute,
  setApplicationApiForTesting,
} from "@/presentation/api";

describe("API route handlers", () => {
  beforeEach(() => {
    const staticRepository = createStaticPublicContentRepository();

    setApplicationApiForTesting(
      createApplicationApi({
        publicContentReadRepository: staticRepository,
        accountAuthRepository: createAccountAuthRepositoryStub(),
        followTargetLookup: staticRepository,
        sessionViewerGateway: createStaticSessionViewerGateway(),
        followOwnerLookup: {
          async findOwnerUserIdByTarget() {
            return "user_organizer_avery";
          },
        },
        discussionTargetLookup: {
          async findCommunityBySlugForPostCreation(communitySlug) {
            return communitySlug === "neighbors-helping-neighbors"
              ? {
                  id: "community_neighbors_helping_neighbors",
                  slug: "neighbors-helping-neighbors",
                  ownerUserId: "user_organizer_avery",
                }
              : null;
          },
          async findPostByIdForCommentCreation(postId) {
            return postId === "post_kickoff_update"
              ? {
                  id: "post_kickoff_update",
                }
              : null;
          },
        },
        discussionWriteRepository: {
          async createPost(input) {
            return {
              id: "post_created_route_test",
              communityId: input.communityId,
              authorUserId: input.authorUserId,
              title: input.title,
              body: input.body,
              status: "published",
              moderationStatus: "visible",
              createdAt: new Date("2026-03-16T15:00:00.000Z"),
            };
          },
          async createComment(input) {
            return {
              id: "comment_created_route_test",
              postId: input.postId,
              authorUserId: input.authorUserId,
              body: input.body,
              status: "published",
              moderationStatus: "visible",
              createdAt: new Date("2026-03-16T15:05:00.000Z"),
            };
          },
        },
        donationTargetLookup: {
          async findFundraiserBySlugForDonation(fundraiserSlug) {
            return fundraiserSlug === "warm-meals-2026"
              ? {
                  id: "fundraiser_warm_meals_2026",
                  slug: "warm-meals-2026",
                }
              : null;
          },
        },
        donationWriteRepository: {
          async createDonation(input) {
            return {
              id: "donation_created_route_test",
              userId: input.userId,
              fundraiserId: input.fundraiserId,
              amount: input.amount,
              status: "completed",
              createdAt: new Date("2026-03-16T15:10:00.000Z"),
            };
          },
        },
        reportTargetLookup: {
          async findReportTargetById(targetType, targetId) {
            if (
              targetType === "comment" &&
              targetId === "comment_container_followup"
            ) {
              return {
                id: "comment_container_followup",
                targetType: "comment",
              };
            }

            return null;
          },
        },
        reportWriteRepository: {
          async createReportIfAbsent(input) {
            return {
              report: {
                id: "report_created_route_test",
                reporterUserId: input.reporterUserId,
                targetType: input.targetType,
                targetId: input.targetId,
                reason: input.reason,
                status: "submitted",
                createdAt: new Date("2026-03-16T15:15:00.000Z"),
              },
              created: true,
            };
          },
        },
        reportReviewLookup: {
          async findReportById(reportId) {
            return reportId === "report_resolve_route_test"
              ? {
                  id: "report_resolve_route_test",
                  reporterUserId: "user_supporter_jordan",
                  targetType: "comment",
                  targetId: "comment_container_followup",
                  reason: "Harassment",
                  status: "submitted",
                  createdAt: new Date("2026-03-16T15:16:00.000Z"),
                }
              : null;
          },
          async findReportModerationContext(targetType, targetId) {
            if (
              targetType === "comment" &&
              targetId === "comment_container_followup"
            ) {
              return {
                targetType: "comment",
                targetId: "comment_container_followup",
                ownerUserId: "user_organizer_avery",
                moderationStatus: "visible",
              };
            }

            return null;
          },
        },
        reportReviewWriteRepository: {
          async setModerationStatus() {
            return;
          },
          async setReportStatus() {
            return;
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
    const body = await response.json();

    expect(body).toMatchObject({
      kind: "profile",
      viewerFollowState: null,
      profile: {
        slug: "avery-johnson",
        displayName: "Avery Johnson",
        followerCount: 5,
        followingCount: 2,
        inspiredSupporterCount: 6,
      },
      relationships: {
        followers: expect.arrayContaining([
          expect.objectContaining({
            displayName: "Elena Gomez",
            profileSlug: "elena-gomez",
          }),
        ]),
        following: expect.arrayContaining([
          expect.objectContaining({
            displayName: "Jordan Lee",
            profileSlug: "jordan-lee",
          }),
        ]),
      },
      connections: {
        communities: expect.arrayContaining([
          expect.objectContaining({
            slug: "neighbors-helping-neighbors",
          }),
          expect.objectContaining({
            slug: "weekend-pantry-crew",
          }),
          expect.objectContaining({
            slug: "school-success-network",
          }),
        ]),
      },
    });
    expect(body.connections.fundraisers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "warm-meals-2026",
          amountRaised: 22000,
        }),
      ]),
    );
  });

  it("includes viewer follow state for a signed-in public profile request", async () => {
    const response = await handleGetPublicProfileRoute(
      new Request("http://test", {
        headers: {
          cookie: createBrowserSessionCookieHeader("demo-supporter-session"),
        },
      }),
      {
        slug: "avery-johnson",
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      kind: "profile",
      viewerFollowState: {
        isFollowing: true,
        isOwnTarget: false,
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
        followerCount: 4,
        fundraiserCount: 2,
        amountRaised: 30000,
        donationCount: 7,
      },
      featuredFundraiser: {
        slug: "warm-meals-2026",
      },
      discussion: [
        {
          title: "Volunteer reminder",
          authorProfileSlug: "jordan-lee",
          comments: [
            {
              body: "Thank you. We will also have extra containers available onsite.",
              authorProfileSlug: "avery-johnson",
            },
          ],
        },
        {
          title: "Kitchen kickoff update",
          authorProfileSlug: "avery-johnson",
          comments: [
            {
              body: "I can help with prep and delivery on the first shift.",
              authorProfileSlug: "jordan-lee",
            },
          ],
        },
      ],
    });
  });

  it("includes self-owned viewer follow state for a signed-in public community request", async () => {
    const response = await handleGetPublicCommunityRoute(
      new Request("http://test", {
        headers: {
          "x-session-token": "demo-organizer-session",
        },
      }),
      {
        slug: "neighbors-helping-neighbors",
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      kind: "community",
      viewerFollowState: {
        isFollowing: false,
        isOwnTarget: true,
      },
    });
  });

  it("includes viewer follow state for a signed-in public fundraiser request", async () => {
    const response = await handleGetPublicFundraiserRoute(
      new Request("http://test", {
        headers: {
          "x-session-token": "demo-supporter-session",
        },
      }),
      {
        slug: "warm-meals-2026",
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      kind: "fundraiser",
      viewerFollowState: {
        isFollowing: true,
        isOwnTarget: false,
      },
    });
  });

  it("returns unauthorized for create post commands without a session token header", async () => {
    const response = await handlePostCreatePostRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          communitySlug: "neighbors-helping-neighbors",
          title: "Kitchen update",
          body: "Saturday prep is still on schedule.",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message:
        "Authentication is required to create posts. Send the x-session-token header to continue.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 201 for an organizer creating a post", async () => {
    const response = await handlePostCreatePostRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-organizer-session",
        },
        body: JSON.stringify({
          communitySlug: "neighbors-helping-neighbors",
          title: "Kitchen update",
          body: "Saturday prep is still on schedule.",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_organizer_avery",
        role: "organizer",
      },
      community: {
        slug: "neighbors-helping-neighbors",
      },
      post: {
        id: "post_created_route_test",
        title: "Kitchen update",
        body: "Saturday prep is still on schedule.",
        status: "published",
        moderationStatus: "visible",
        createdAt: "2026-03-16T15:00:00.000Z",
      },
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("accepts a browser session cookie when an organizer creates a post", async () => {
    const response = await handlePostCreatePostRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: createBrowserSessionCookieHeader("demo-organizer-session"),
        },
        body: JSON.stringify({
          communitySlug: "neighbors-helping-neighbors",
          title: "Kitchen update",
          body: "Saturday prep is still on schedule.",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_organizer_avery",
        role: "organizer",
      },
      community: {
        slug: "neighbors-helping-neighbors",
      },
      post: {
        id: "post_created_route_test",
        title: "Kitchen update",
        body: "Saturday prep is still on schedule.",
        status: "published",
        moderationStatus: "visible",
        createdAt: "2026-03-16T15:00:00.000Z",
      },
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 403 when a supporter attempts to create a community post", async () => {
    const response = await handlePostCreatePostRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-supporter-session",
        },
        body: JSON.stringify({
          communitySlug: "neighbors-helping-neighbors",
          title: "Kitchen update",
          body: "Saturday prep is still on schedule.",
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "forbidden",
      message: "Only an authorized owner, moderator, or admin can create posts.",
    });
  });

  it("returns unauthorized for create comment commands without a session token header", async () => {
    const response = await handlePostCreateCommentRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          postId: "post_kickoff_update",
          body: "I can help with prep and delivery.",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message:
        "Authentication is required to create comments. Send the x-session-token header to continue.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 201 for an authenticated comment creation command", async () => {
    const response = await handlePostCreateCommentRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-supporter-session",
        },
        body: JSON.stringify({
          postId: "post_kickoff_update",
          body: "I can help with prep and delivery.",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      comment: {
        id: "comment_created_route_test",
        postId: "post_kickoff_update",
        body: "I can help with prep and delivery.",
        status: "published",
        moderationStatus: "visible",
        createdAt: "2026-03-16T15:05:00.000Z",
      },
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("accepts a browser session cookie for comment creation", async () => {
    const response = await handlePostCreateCommentRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: createBrowserSessionCookieHeader("demo-supporter-session"),
        },
        body: JSON.stringify({
          postId: "post_kickoff_update",
          body: "I can help with prep and delivery.",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      comment: {
        id: "comment_created_route_test",
        postId: "post_kickoff_update",
        body: "I can help with prep and delivery.",
        status: "published",
        moderationStatus: "visible",
        createdAt: "2026-03-16T15:05:00.000Z",
      },
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns unauthorized for donation submission without a session token header", async () => {
    const response = await handlePostSubmitDonationRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fundraiserSlug: "warm-meals-2026",
          amount: 2500,
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message:
        "Authentication is required to submit donations. Send the x-session-token header to continue.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 201 for an authenticated donation submission", async () => {
    const response = await handlePostSubmitDonationRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-supporter-session",
        },
        body: JSON.stringify({
          fundraiserSlug: "warm-meals-2026",
          amount: 2500,
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      fundraiser: {
        slug: "warm-meals-2026",
      },
      donation: {
        id: "donation_created_route_test",
        amount: 2500,
        status: "completed",
        createdAt: "2026-03-16T15:10:00.000Z",
      },
      meta: {
        sessionTokenHeader: "x-session-token",
        mockedPaymentProcessor: true,
      },
    });
  });

  it("accepts a browser session cookie for donation submission", async () => {
    const response = await handlePostSubmitDonationRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: createBrowserSessionCookieHeader("demo-supporter-session"),
        },
        body: JSON.stringify({
          fundraiserSlug: "warm-meals-2026",
          amount: 2500,
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      fundraiser: {
        slug: "warm-meals-2026",
      },
      donation: {
        id: "donation_created_route_test",
        amount: 2500,
        status: "completed",
        createdAt: "2026-03-16T15:10:00.000Z",
      },
      meta: {
        sessionTokenHeader: "x-session-token",
        mockedPaymentProcessor: true,
      },
    });
  });

  it("returns unauthorized for report submission without a session token header", async () => {
    const response = await handlePostSubmitReportRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          targetType: "comment",
          targetId: "comment_container_followup",
          reason: "Harassment",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message:
        "Authentication is required to submit reports. Send the x-session-token header to continue.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 201 for an authenticated report submission", async () => {
    const response = await handlePostSubmitReportRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-supporter-session",
        },
        body: JSON.stringify({
          targetType: "comment",
          targetId: "comment_container_followup",
          reason: "Harassment",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      report: {
        id: "report_created_route_test",
        targetType: "comment",
        targetId: "comment_container_followup",
        reason: "Harassment",
        status: "submitted",
        createdAt: "2026-03-16T15:15:00.000Z",
      },
      created: true,
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("accepts a browser session cookie for report submission", async () => {
    const response = await handlePostSubmitReportRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: createBrowserSessionCookieHeader("demo-supporter-session"),
        },
        body: JSON.stringify({
          targetType: "comment",
          targetId: "comment_container_followup",
          reason: "Harassment",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      report: {
        id: "report_created_route_test",
        targetType: "comment",
        targetId: "comment_container_followup",
        reason: "Harassment",
        status: "submitted",
        createdAt: "2026-03-16T15:15:00.000Z",
      },
      created: true,
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns unauthorized for report resolution without a session token header", async () => {
    const response = await handlePostResolveReportRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          reportId: "report_resolve_route_test",
          action: "remove",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message:
        "Authentication is required to moderate content. Send the x-session-token header to continue.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 200 for a moderator resolving a report action", async () => {
    const response = await handlePostResolveReportRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": "demo-moderator-session",
        },
        body: JSON.stringify({
          reportId: "report_resolve_route_test",
          action: "remove",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_moderator_morgan",
        role: "moderator",
      },
      resolution: {
        reportId: "report_resolve_route_test",
        action: "remove",
        reportStatus: "actioned",
      },
      target: {
        type: "comment",
        id: "comment_container_followup",
        moderationStatus: "removed",
      },
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("accepts a browser session cookie for report resolution", async () => {
    const response = await handlePostResolveReportRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: createBrowserSessionCookieHeader("demo-moderator-session"),
        },
        body: JSON.stringify({
          reportId: "report_resolve_route_test",
          action: "remove",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_moderator_morgan",
        role: "moderator",
      },
      resolution: {
        reportId: "report_resolve_route_test",
        action: "remove",
        reportStatus: "actioned",
      },
      target: {
        type: "comment",
        id: "comment_container_followup",
        moderationStatus: "removed",
      },
      meta: {
        sessionTokenHeader: "x-session-token",
      },
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

  it("accepts a browser session cookie for follow commands", async () => {
    const response = await handlePostFollowTargetRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: createBrowserSessionCookieHeader("demo-supporter-session"),
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

  it("accepts a browser session cookie for unfollow commands", async () => {
    const response = await handlePostUnfollowTargetRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: createBrowserSessionCookieHeader("demo-supporter-session"),
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

const createBrowserSessionCookieHeader = (sessionToken: string): string =>
  `${browserSessionCookieName}=${encodeURIComponent(sessionToken)}`;

const createAccountAuthRepositoryStub = () => ({
  async findViewerBySessionToken(sessionToken: string | null) {
    switch (sessionToken) {
      case "demo-organizer-session":
        return {
          userId: "user_organizer_avery",
          role: "organizer" as const,
        };
      case "demo-supporter-session":
        return {
          userId: "user_supporter_jordan",
          role: "supporter" as const,
        };
      case "demo-moderator-session":
        return {
          userId: "user_moderator_morgan",
          role: "moderator" as const,
        };
      default:
        return null;
    }
  },
  async findUserByEmail() {
    return null;
  },
  async saveUser() {
    return;
  },
  async setPasswordCredential() {
    return;
  },
  async verifyPasswordCredential() {
    return false;
  },
  async createSession() {
    return "session_unused";
  },
  async invalidateSession() {
    return;
  },
});
