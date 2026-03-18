import { createApplicationApi } from "@/application";
import {
  handlePostRefreshDigestNarrationRoute,
  handlePostRecordDigestViewRoute,
  setApplicationApiForTesting,
} from "@/presentation/api";
import { browserSessionCookieName } from "@/presentation/auth";

describe("digest API route handlers", () => {
  it("returns 400 when viewedThrough is missing", async () => {
    setApplicationApiForTesting(createApplicationApiStub());

    const response = await handlePostRecordDigestViewRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      message: "viewedThrough is required.",
    });
  });

  it("returns 401 when the viewer is not authenticated", async () => {
    setApplicationApiForTesting(
      createApplicationApiStub({
        recordDigestViewResult: {
          status: "unauthorized",
          message: "Authentication is required to acknowledge your digest.",
        },
      }),
    );

    const response = await handlePostRecordDigestViewRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          viewedThrough: "2026-03-18T12:00:00.000Z",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message: "Authentication is required to acknowledge your digest.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 200 for an authenticated digest acknowledgement", async () => {
    const applicationApi = createApplicationApiStub();
    setApplicationApiForTesting(applicationApi);

    const response = await handlePostRecordDigestViewRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `${browserSessionCookieName}=demo-supporter-session`,
        },
        body: JSON.stringify({
          viewedThrough: "2026-03-18T12:00:00.000Z",
        }),
      }),
    );

    expect(applicationApi.recordDigestView).toHaveBeenCalledWith({
      sessionToken: "demo-supporter-session",
      viewedThrough: "2026-03-18T12:00:00.000Z",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      viewedThrough: "2026-03-18T12:00:00.000Z",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 400 when narration refresh windowStart is missing", async () => {
    setApplicationApiForTesting(createApplicationApiStub());

    const response = await handlePostRefreshDigestNarrationRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          windowEnd: "2026-03-18T12:00:00.000Z",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      message: "windowStart is required.",
    });
  });

  it("returns 401 when narration refresh is unauthenticated", async () => {
    setApplicationApiForTesting(
      createApplicationApiStub({
        refreshSupporterDigestNarrationResult: {
          status: "unauthorized",
          message: "Authentication is required to refresh your digest narration.",
        },
      }),
    );

    const response = await handlePostRefreshDigestNarrationRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          windowStart: "2026-03-17T18:00:00.000Z",
          windowEnd: "2026-03-18T12:00:00.000Z",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message: "Authentication is required to refresh your digest narration.",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 200 for an authenticated narration refresh", async () => {
    const applicationApi = createApplicationApiStub();
    setApplicationApiForTesting(applicationApi);

    const response = await handlePostRefreshDigestNarrationRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `${browserSessionCookieName}=demo-supporter-session`,
        },
        body: JSON.stringify({
          windowStart: "2026-03-17T18:00:00.000Z",
          windowEnd: "2026-03-18T12:00:00.000Z",
        }),
      }),
    );

    expect(applicationApi.refreshSupporterDigestNarration).toHaveBeenCalledWith({
      sessionToken: "demo-supporter-session",
      windowStart: "2026-03-17T18:00:00.000Z",
      windowEnd: "2026-03-18T12:00:00.000Z",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      digest: createDigestModel({
        generationMode: "openai",
        narration: {
          status: "completed",
          reason: null,
        },
      }),
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });
});

const createApplicationApiStub = ({
  recordDigestViewResult = {
    status: "success" as const,
    viewer: {
      userId: "user_supporter_jordan",
      role: "supporter" as const,
    },
    viewedThrough: "2026-03-18T12:00:00.000Z",
  },
  refreshSupporterDigestNarrationResult = {
    status: "success" as const,
    viewer: {
      userId: "user_supporter_jordan",
      role: "supporter" as const,
    },
    digest: createDigestModel({
      generationMode: "openai",
      narration: {
        status: "completed" as const,
        reason: null,
      },
    }),
  },
}: {
  recordDigestViewResult?: Awaited<
    ReturnType<ReturnType<typeof createApplicationApi>["recordDigestView"]>
  >;
  refreshSupporterDigestNarrationResult?: Awaited<
    ReturnType<ReturnType<typeof createApplicationApi>["refreshSupporterDigestNarration"]>
  >;
} = {}): ReturnType<typeof createApplicationApi> => ({
  signUp: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getSession: vi.fn(),
  getAnalyticsDashboard: vi.fn(),
  resetPrototypeData: vi.fn(),
  getPublicProfileBySlug: vi.fn(),
  getPublicProfileSlugByUserId: vi.fn(),
  getPublicFundraiserBySlug: vi.fn(),
  getPublicCommunityBySlug: vi.fn(),
  listPublicFundraisers: vi.fn(),
  listPublicCommunities: vi.fn(),
  getSupporterDigest: vi.fn(),
  refreshSupporterDigestNarration: vi
    .fn()
    .mockResolvedValue(refreshSupporterDigestNarrationResult),
  recordDigestView: vi.fn().mockResolvedValue(recordDigestViewResult),
  listOwnedCommunitiesForViewer: vi.fn(),
  createCommunity: vi.fn(),
  createPost: vi.fn(),
  createComment: vi.fn(),
  createFundraiser: vi.fn(),
  submitDonation: vi.fn(),
  startDonationIntent: vi.fn(),
  submitReport: vi.fn(),
  resolveReport: vi.fn(),
  followTarget: vi.fn(),
  unfollowTarget: vi.fn(),
});

const createDigestModel = ({
  generationMode = "deterministic" as const,
  narration = {
    status: "pending" as const,
    reason: null,
  },
  highlights = [
    {
      id: "community_update:post_evening_update",
      type: "community_update" as const,
      headline: "Avery shared a new organizer update.",
      body: "Supporters can now catch up on the latest evening prep details.",
      ctaLabel: "Read update",
      href: "/communities/neighbors-helping-neighbors#post-post_evening_update",
      occurredAt: "2026-03-18T10:30:00.000Z",
      score: 144,
    },
  ],
}: {
  generationMode?: "openai" | "deterministic";
  narration?: {
    status: "pending" | "completed" | "not_requested" | "unavailable";
    reason: "missing_configuration" | "provider_error" | "invalid_response" | null;
  };
  highlights?: {
    id: string;
    type: "community_update";
    headline: string;
    body: string;
    ctaLabel: string;
    href: string;
    occurredAt: string;
    score: number;
  }[];
} = {}) => ({
  kind: "supporter_digest" as const,
  windowStart: "2026-03-17T18:00:00.000Z",
  windowEnd: "2026-03-18T12:00:00.000Z",
  generationMode,
  narration,
  highlights,
});
