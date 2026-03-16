import {
  followTarget,
  type FollowOwnerLookup,
  type FollowTargetLookup,
  type FollowWriteRepository,
  type SessionViewerGateway,
} from "@/application";

describe("followTarget", () => {
  it("rejects unsupported target types before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const followTargetLookup = createFollowTargetLookupStub();
    const followOwnerLookup = createFollowOwnerLookupStub();
    const followWriteRepository = createFollowWriteRepositoryStub();

    const result = await followTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
        followOwnerLookup,
        followWriteRepository,
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
    expect(followOwnerLookup.findOwnerUserIdByTarget).not.toHaveBeenCalled();
    expect(followWriteRepository.createFollowIfAbsent).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const followTargetLookup = createFollowTargetLookupStub();
    const followOwnerLookup = createFollowOwnerLookupStub();
    const followWriteRepository = createFollowWriteRepositoryStub();

    const result = await followTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
        followOwnerLookup,
        followWriteRepository,
      },
      {
        sessionToken: null,
        targetType: "community",
        targetSlug: "neighbors-helping-neighbors",
      },
    );

    expect(result.status).toBe("unauthorized");
    expect(followTargetLookup.findTargetBySlug).not.toHaveBeenCalled();
    expect(followOwnerLookup.findOwnerUserIdByTarget).not.toHaveBeenCalled();
    expect(followWriteRepository.createFollowIfAbsent).not.toHaveBeenCalled();
  });

  it("rejects self-follow attempts after resolving target ownership", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
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
    const followOwnerLookup = createFollowOwnerLookupStub({
      ownerUserId: "user_supporter_jordan",
    });
    const followWriteRepository = createFollowWriteRepositoryStub();

    const result = await followTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
        followOwnerLookup,
        followWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "community",
        targetSlug: "neighbors-helping-neighbors",
      },
    );

    expect(followTargetLookup.findTargetBySlug).toHaveBeenCalledWith(
      "community",
      "neighbors-helping-neighbors",
    );
    expect(followOwnerLookup.findOwnerUserIdByTarget).toHaveBeenCalledWith(
      "community",
      "community_123",
    );
    expect(result).toEqual({
      status: "forbidden",
      message: "You cannot follow your own profile, fundraiser, or community.",
    });
    expect(followWriteRepository.createFollowIfAbsent).not.toHaveBeenCalled();
  });

  it("creates follows idempotently through the write repository", async () => {
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
    const followOwnerLookup = createFollowOwnerLookupStub({
      ownerUserId: "user_999",
    });
    const followWriteRepository = createFollowWriteRepositoryStub({
      result: {
        follow: {
          id: "follow_123",
          userId: "user_123",
          targetType: "community",
          targetId: "community_123",
          createdAt: new Date("2026-03-16T12:00:00.000Z"),
        },
        created: false,
      },
    });

    const result = await followTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
        followOwnerLookup,
        followWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "community",
        targetSlug: "neighbors-helping-neighbors",
      },
    );

    expect(followWriteRepository.createFollowIfAbsent).toHaveBeenCalledWith({
      userId: "user_123",
      targetType: "community",
      targetId: "community_123",
    });
    expect(result).toEqual({
      status: "success",
      viewer: {
        userId: "user_123",
        role: "supporter",
      },
      target: {
        type: "community",
        slug: "neighbors-helping-neighbors",
      },
      followId: "follow_123",
      created: false,
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

const createFollowOwnerLookupStub = ({
  ownerUserId = null,
}: {
  ownerUserId?: Awaited<
    ReturnType<FollowOwnerLookup["findOwnerUserIdByTarget"]>
  >;
} = {}): FollowOwnerLookup & {
  findOwnerUserIdByTarget: ReturnType<typeof vi.fn>;
} => ({
  findOwnerUserIdByTarget: vi.fn().mockResolvedValue(ownerUserId),
});

const createFollowWriteRepositoryStub = ({
  result = {
    follow: {
      id: "follow_1",
      userId: "user_1",
      targetType: "community",
      targetId: "community_1",
      createdAt: new Date("2026-03-16T12:00:00.000Z"),
    },
    created: true,
  },
}: {
  result?: Awaited<ReturnType<FollowWriteRepository["createFollowIfAbsent"]>>;
} = {}): FollowWriteRepository & {
  createFollowIfAbsent: ReturnType<typeof vi.fn>;
} => ({
  createFollowIfAbsent: vi.fn().mockResolvedValue(result),
});
