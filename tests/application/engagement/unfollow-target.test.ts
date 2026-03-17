import {
  unfollowTarget,
  type FollowTargetLookup,
  type FollowWriteRepository,
  type SessionViewerGateway,
} from "@/application";

describe("unfollowTarget", () => {
  it("rejects unsupported target types before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const followTargetLookup = createFollowTargetLookupStub();
    const followWriteRepository = createFollowWriteRepositoryStub();

    const result = await unfollowTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
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
    expect(followWriteRepository.removeFollowIfPresent).not.toHaveBeenCalled();
    expect(followWriteRepository.countFollowersForTarget).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const followTargetLookup = createFollowTargetLookupStub();
    const followWriteRepository = createFollowWriteRepositoryStub();

    const result = await unfollowTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
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
    expect(followWriteRepository.removeFollowIfPresent).not.toHaveBeenCalled();
    expect(followWriteRepository.countFollowersForTarget).not.toHaveBeenCalled();
  });

  it("returns not_found when target lookup fails", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_123",
        role: "supporter",
      },
    });
    const followTargetLookup = createFollowTargetLookupStub();
    const followWriteRepository = createFollowWriteRepositoryStub();

    const result = await unfollowTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
        followWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "community",
        targetSlug: "missing-target",
      },
    );

    expect(result).toEqual({
      status: "not_found",
      message: 'No community was found for slug "missing-target".',
    });
    expect(followWriteRepository.removeFollowIfPresent).not.toHaveBeenCalled();
    expect(followWriteRepository.countFollowersForTarget).not.toHaveBeenCalled();
  });

  it("removes follow records idempotently through the write repository", async () => {
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
    const followWriteRepository = createFollowWriteRepositoryStub({
      removed: false,
      followerCount: 7,
    });

    const result = await unfollowTarget(
      {
        sessionViewerGateway,
        followTargetLookup,
        followWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        targetType: "community",
        targetSlug: "neighbors-helping-neighbors",
      },
    );

    expect(followWriteRepository.removeFollowIfPresent).toHaveBeenCalledWith({
      userId: "user_123",
      targetType: "community",
      targetId: "community_123",
    });
    expect(followWriteRepository.countFollowersForTarget).toHaveBeenCalledWith({
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
      removed: false,
      followerCount: 7,
      following: false,
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

const createFollowWriteRepositoryStub = ({
  removed = true,
  followerCount = 0,
}: {
  removed?: boolean;
  followerCount?: number;
} = {}): FollowWriteRepository & {
  createFollowIfAbsent: ReturnType<typeof vi.fn>;
  removeFollowIfPresent: ReturnType<typeof vi.fn>;
  countFollowersForTarget: ReturnType<typeof vi.fn>;
} => ({
  createFollowIfAbsent: vi.fn(),
  removeFollowIfPresent: vi.fn().mockResolvedValue({
    removed,
  }),
  countFollowersForTarget: vi.fn().mockResolvedValue(followerCount),
});
