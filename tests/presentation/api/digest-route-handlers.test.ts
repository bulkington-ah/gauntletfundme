import { createApplicationApi } from "@/application";
import {
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
}: {
  recordDigestViewResult?: Awaited<
    ReturnType<ReturnType<typeof createApplicationApi>["recordDigestView"]>
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
