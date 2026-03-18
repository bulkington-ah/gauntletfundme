import {
  type AnalyticsEventPublisher,
  createCommunityCommand,
  type CommunitySessionViewerGateway,
  type CommunityWriteRepository,
} from "@/application";

describe("createCommunityCommand", () => {
  it("rejects invalid requests before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const communityWriteRepository = createCommunityWriteRepositoryStub();

    const result = await createCommunityCommand(
      {
        sessionViewerGateway,
        communityWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        name: "",
        description: "A place to organize support.",
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "name is required.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).not.toHaveBeenCalled();
    expect(
      communityWriteRepository.findCommunityBySlugForCreation,
    ).not.toHaveBeenCalled();
    expect(communityWriteRepository.createCommunity).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const communityWriteRepository = createCommunityWriteRepositoryStub();

    const result = await createCommunityCommand(
      {
        sessionViewerGateway,
        communityWriteRepository,
      },
      {
        sessionToken: null,
        name: "Neighbors Helping Neighbors",
        description: "A place to organize support.",
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message:
        "Authentication is required to create communities. Send the x-session-token header to continue.",
    });
    expect(
      communityWriteRepository.findCommunityBySlugForCreation,
    ).not.toHaveBeenCalled();
  });

  it("returns conflict when the generated slug already exists", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const communityWriteRepository = createCommunityWriteRepositoryStub({
      existingCommunity: {
        id: "community_neighbors_helping_neighbors",
        slug: "neighbors-helping-neighbors",
      },
    });

    const result = await createCommunityCommand(
      {
        sessionViewerGateway,
        communityWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        name: "Neighbors Helping Neighbors",
        description: "A place to organize support.",
      },
    );

    expect(result).toEqual({
      status: "conflict",
      message: 'A community already exists for slug "neighbors-helping-neighbors".',
    });
    expect(communityWriteRepository.createCommunity).not.toHaveBeenCalled();
  });

  it("creates communities for authenticated viewers and assigns them as the owner", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const communityWriteRepository = createCommunityWriteRepositoryStub({
      createdCommunity: {
        id: "community_jordan_garden_network",
        ownerUserId: "user_supporter_jordan",
        slug: "jordan-garden-network",
        name: "Jordan Garden Network",
        description: "Shared planning for pantry beds and community harvests.",
        visibility: "public",
        createdAt: new Date("2026-03-18T15:00:00.000Z"),
      },
    });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();

    const result = await createCommunityCommand(
      {
        sessionViewerGateway,
        communityWriteRepository,
        analyticsEventPublisher,
      },
      {
        sessionToken: "demo-supporter-session",
        name: "Jordan Garden Network",
        description: "Shared planning for pantry beds and community harvests.",
      },
    );

    expect(
      communityWriteRepository.findCommunityBySlugForCreation,
    ).toHaveBeenCalledWith("jordan-garden-network");
    expect(communityWriteRepository.createCommunity).toHaveBeenCalledWith({
      ownerUserId: "user_supporter_jordan",
      slug: "jordan-garden-network",
      name: "Jordan Garden Network",
      description: "Shared planning for pantry beds and community harvests.",
      visibility: "public",
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "community.created",
        payload: {
          viewerUserId: "user_supporter_jordan",
          communityId: "community_jordan_garden_network",
          communitySlug: "jordan-garden-network",
        },
      }),
    );
    expect(result).toEqual({
      status: "success",
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      community: {
        id: "community_jordan_garden_network",
        slug: "jordan-garden-network",
        name: "Jordan Garden Network",
        description: "Shared planning for pantry beds and community harvests.",
        visibility: "public",
        createdAt: "2026-03-18T15:00:00.000Z",
      },
    });
  });
});

const createSessionViewerGatewayStub = ({
  viewer = null,
}: {
  viewer?: Awaited<
    ReturnType<CommunitySessionViewerGateway["findViewerBySessionToken"]>
  >;
} = {}): CommunitySessionViewerGateway & {
  findViewerBySessionToken: ReturnType<typeof vi.fn>;
} => ({
  findViewerBySessionToken: vi.fn().mockResolvedValue(viewer),
});

const createCommunityWriteRepositoryStub = ({
  existingCommunity = null,
  createdCommunity = {
    id: "community_created_default",
    ownerUserId: "user_supporter_jordan",
    slug: "community-created-default",
    name: "Community Created Default",
    description: "Default description",
    visibility: "public" as const,
    createdAt: new Date("2026-03-18T15:00:00.000Z"),
  },
}: {
  existingCommunity?: Awaited<
    ReturnType<CommunityWriteRepository["findCommunityBySlugForCreation"]>
  >;
  createdCommunity?: Awaited<ReturnType<CommunityWriteRepository["createCommunity"]>>;
} = {}): CommunityWriteRepository & {
  findCommunityBySlugForCreation: ReturnType<typeof vi.fn>;
  createCommunity: ReturnType<typeof vi.fn>;
} => ({
  findCommunityBySlugForCreation: vi.fn().mockResolvedValue(existingCommunity),
  createCommunity: vi.fn().mockResolvedValue(createdCommunity),
});

const createAnalyticsEventPublisherStub = (): AnalyticsEventPublisher & {
  publish: ReturnType<typeof vi.fn>;
} => ({
  publish: vi.fn().mockResolvedValue(undefined),
});
