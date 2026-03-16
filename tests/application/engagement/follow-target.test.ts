import {
  followTarget,
  type FollowTargetLookup,
  type SessionViewerGateway,
} from "@/application";

describe("followTarget", () => {
  it("rejects unsupported target types before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const followTargetLookup = createFollowTargetLookupStub();

    const result = await followTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "post",
        targetSlug: "neighbors-helping-neighbors",
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "targetType must be one of: profile, fundraiser, community.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).not.toHaveBeenCalled();
    expect(followTargetLookup.findTargetBySlug).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const followTargetLookup = createFollowTargetLookupStub();

    const result = await followTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
      },
      {
        sessionToken: null,
        targetType: "community",
        targetSlug: "neighbors-helping-neighbors",
      },
    );

    expect(result.status).toBe("unauthorized");
    expect(followTargetLookup.findTargetBySlug).not.toHaveBeenCalled();
  });

  it("confirms the write boundary after auth and target lookup", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_123",
        role: "supporter",
      },
    });
    const followTargetLookup = createFollowTargetLookupStub({
      target: {
        id: "community_123",
        slug: "neighbors-helping-neighbors",
        targetType: "community",
      },
    });

    const result = await followTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "community",
        targetSlug: " Neighbors Helping Neighbors ",
      },
    );

    expect(sessionViewerGateway.findViewerBySessionToken).toHaveBeenCalledWith(
      "demo-supporter-session",
    );
    expect(followTargetLookup.findTargetBySlug).toHaveBeenCalledWith(
      "community",
      "neighbors-helping-neighbors",
    );
    expect(result).toEqual({
      status: "not_implemented",
      message:
        "The follow command boundary is wired through application and auth checks, but persistence is intentionally deferred to a later task.",
      viewer: {
        userId: "user_123",
        role: "supporter",
      },
      target: {
        type: "community",
        slug: "neighbors-helping-neighbors",
      },
    });
  });
});

const createSessionViewerGatewayStub = ({
  viewer = null,
}: {
  viewer?: Awaited<ReturnType<SessionViewerGateway["findViewerBySessionToken"]>>;
} = {}): SessionViewerGateway & {
  findViewerBySessionToken: ReturnType<typeof vi.fn>;
} => ({
  findViewerBySessionToken: vi.fn().mockResolvedValue(viewer),
});

const createFollowTargetLookupStub = ({
  target = null,
}: {
  target?: Awaited<ReturnType<FollowTargetLookup["findTargetBySlug"]>>;
} = {}): FollowTargetLookup & {
  findTargetBySlug: ReturnType<typeof vi.fn>;
} => ({
  findTargetBySlug: vi.fn().mockResolvedValue(target),
});
