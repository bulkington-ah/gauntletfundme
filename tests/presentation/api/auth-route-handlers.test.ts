import { createApplicationApi } from "@/application";
import {
  browserSessionCookieName,
  clearSessionCookieHeader,
  createSessionCookieHeader,
} from "@/presentation/auth";
import {
  handleGetSessionRoute,
  handlePostLoginRoute,
  handlePostLogoutRoute,
  handlePostSignUpRoute,
  setApplicationApiForTesting,
} from "@/presentation/api";

describe("auth API route handlers", () => {
  it("returns 400 when signup request body is incomplete", async () => {
    const response = await handlePostSignUpRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "new.user@example.com",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      message: "email, displayName, and password are required.",
    });
  });

  it("returns 201 and session metadata on signup success", async () => {
    setApplicationApiForTesting(
      createApplicationApiStub({
        signUpResult: {
          status: "success",
          sessionToken: "session_created_123",
          viewer: {
            userId: "user_123",
            role: "supporter",
          },
        },
      }),
    );

    const response = await handlePostSignUpRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "new.user@example.com",
          displayName: "New User",
          password: "password123",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toBe(
      createSessionCookieHeader("session_created_123"),
    );
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_123",
        role: "supporter",
      },
      sessionToken: "session_created_123",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 200 and sets a browser session cookie on login success", async () => {
    setApplicationApiForTesting(createApplicationApiStub());

    const response = await handlePostLoginRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "new.user@example.com",
          password: "password123",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBe(
      createSessionCookieHeader("session_123"),
    );
    await expect(response.json()).resolves.toEqual({
      viewer: {
        userId: "user_123",
        role: "supporter",
      },
      sessionToken: "session_123",
      meta: {
        sessionTokenHeader: "x-session-token",
      },
    });
  });

  it("returns 401 for invalid login credentials", async () => {
    setApplicationApiForTesting(
      createApplicationApiStub({
        loginResult: {
          status: "unauthorized",
          message: "Invalid email or password.",
        },
      }),
    );

    const response = await handlePostLoginRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "new.user@example.com",
          password: "wrong",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message: "Invalid email or password.",
    });
  });

  it("returns 200 for logout when a session cookie is provided and clears it", async () => {
    const applicationApi = createApplicationApiStub();
    setApplicationApiForTesting(applicationApi);

    const response = await handlePostLogoutRoute(
      new Request("http://test", {
        method: "POST",
        headers: {
          cookie: `${browserSessionCookieName}=session_cookie_123`,
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBe(clearSessionCookieHeader());
    expect(applicationApi.logout).toHaveBeenCalledWith({
      sessionToken: "session_cookie_123",
    });
    await expect(response.json()).resolves.toEqual({
      message: "Session ended.",
    });
  });

  it("prefers the session cookie over the header during session lookup", async () => {
    const applicationApi = createApplicationApiStub();
    setApplicationApiForTesting(applicationApi);

    const response = await handleGetSessionRoute(
      new Request("http://test", {
        headers: {
          cookie: `${browserSessionCookieName}=session_cookie_123`,
          "x-session-token": "session_header_123",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(applicationApi.getSession).toHaveBeenCalledWith({
      sessionToken: "session_cookie_123",
    });
  });

  it("falls back to the session header when no browser session cookie exists", async () => {
    const applicationApi = createApplicationApiStub();
    setApplicationApiForTesting(applicationApi);

    const response = await handleGetSessionRoute(
      new Request("http://test", {
        headers: {
          "x-session-token": "session_header_123",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(applicationApi.getSession).toHaveBeenCalledWith({
      sessionToken: "session_header_123",
    });
  });

  it("returns 401 for session lookup without a valid token", async () => {
    setApplicationApiForTesting(
      createApplicationApiStub({
        sessionResult: {
          status: "unauthorized",
          message: "A valid session token is required.",
        },
      }),
    );

    const response = await handleGetSessionRoute(new Request("http://test"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "unauthorized",
      message: "A valid session token is required.",
    });
  });
});

const createApplicationApiStub = ({
  signUpResult = {
    status: "success" as const,
    sessionToken: "session_123",
    viewer: {
      userId: "user_123",
      role: "supporter" as const,
    },
  },
  loginResult = {
    status: "success" as const,
    sessionToken: "session_123",
    viewer: {
      userId: "user_123",
      role: "supporter" as const,
    },
  },
  logoutResult = {
    status: "success" as const,
    message: "Session ended.",
  },
  sessionResult = {
    status: "success" as const,
    viewer: {
      userId: "user_123",
      role: "supporter" as const,
    },
  },
  resetPrototypeDataResult = {
    status: "success" as const,
    message: "Prototype data reset complete.",
  },
}: {
  signUpResult?: Awaited<ReturnType<ReturnType<typeof createApplicationApi>["signUp"]>>;
  loginResult?: Awaited<ReturnType<ReturnType<typeof createApplicationApi>["login"]>>;
  logoutResult?: Awaited<
    ReturnType<ReturnType<typeof createApplicationApi>["logout"]>
  >;
  sessionResult?: Awaited<
    ReturnType<ReturnType<typeof createApplicationApi>["getSession"]>
  >;
  resetPrototypeDataResult?: Awaited<
    ReturnType<ReturnType<typeof createApplicationApi>["resetPrototypeData"]>
  >;
} = {}): ReturnType<typeof createApplicationApi> => ({
  signUp: vi.fn().mockResolvedValue(signUpResult),
  login: vi.fn().mockResolvedValue(loginResult),
  logout: vi.fn().mockResolvedValue(logoutResult),
  getSession: vi.fn().mockResolvedValue(sessionResult),
  resetPrototypeData: vi.fn().mockResolvedValue(resetPrototypeDataResult),
  getPublicProfileBySlug: vi.fn().mockResolvedValue({
    status: "not_found",
    message: "not configured for this test",
  }),
  getPublicProfileSlugByUserId: vi.fn().mockResolvedValue(null),
  getPublicFundraiserBySlug: vi.fn().mockResolvedValue({
    status: "not_found",
    message: "not configured for this test",
  }),
  getPublicCommunityBySlug: vi.fn().mockResolvedValue({
    status: "not_found",
    message: "not configured for this test",
  }),
  listPublicFundraisers: vi.fn().mockResolvedValue({
    status: "success",
    fundraisers: [],
  }),
  listPublicCommunities: vi.fn().mockResolvedValue({
    status: "success",
    communities: [],
  }),
  getSupporterDigest: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  refreshSupporterDigestNarration: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  recordDigestView: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  listOwnedCommunitiesForViewer: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  createCommunity: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  createPost: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  createComment: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  submitDonation: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  startDonationIntent: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  submitReport: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  resolveReport: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  followTarget: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
  unfollowTarget: vi.fn().mockResolvedValue({
    status: "unauthorized",
    message: "not configured for this test",
  }),
});
