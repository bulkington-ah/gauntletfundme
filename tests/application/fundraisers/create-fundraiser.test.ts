import {
  type AnalyticsEventPublisher,
  createFundraiserCommand,
  type FundraiserCommunityOwnershipLookup,
  type FundraiserSessionViewerGateway,
  type FundraiserWriteRepository,
} from "@/application";

describe("createFundraiserCommand", () => {
  it("rejects invalid requests before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const fundraiserWriteRepository = createFundraiserWriteRepositoryStub();
    const fundraiserCommunityOwnershipLookup =
      createFundraiserCommunityOwnershipLookupStub();

    const result = await createFundraiserCommand(
      {
        sessionViewerGateway,
        fundraiserWriteRepository,
        fundraiserCommunityOwnershipLookup,
      },
      {
        sessionToken: "demo-supporter-session",
        title: "",
        story: "Funding pantry deliveries through spring.",
        goalAmount: 0,
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "title is required.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).not.toHaveBeenCalled();
    expect(
      fundraiserWriteRepository.findFundraiserBySlugForCreation,
    ).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const fundraiserWriteRepository = createFundraiserWriteRepositoryStub();
    const fundraiserCommunityOwnershipLookup =
      createFundraiserCommunityOwnershipLookupStub();

    const result = await createFundraiserCommand(
      {
        sessionViewerGateway,
        fundraiserWriteRepository,
        fundraiserCommunityOwnershipLookup,
      },
      {
        sessionToken: null,
        title: "Spring pantry drive",
        story: "Funding pantry deliveries through spring.",
        goalAmount: 18000,
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message:
        "Authentication is required to create fundraisers. Send the x-session-token header to continue.",
    });
  });

  it("returns conflict when the generated slug already exists", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const fundraiserWriteRepository = createFundraiserWriteRepositoryStub({
      existingFundraiser: {
        id: "fundraiser_spring_pantry_drive",
        slug: "spring-pantry-drive",
      },
    });
    const fundraiserCommunityOwnershipLookup =
      createFundraiserCommunityOwnershipLookupStub();

    const result = await createFundraiserCommand(
      {
        sessionViewerGateway,
        fundraiserWriteRepository,
        fundraiserCommunityOwnershipLookup,
      },
      {
        sessionToken: "demo-supporter-session",
        title: "Spring Pantry Drive",
        story: "Funding pantry deliveries through spring.",
        goalAmount: 18000,
      },
    );

    expect(result).toEqual({
      status: "conflict",
      message: 'A fundraiser already exists for slug "spring-pantry-drive".',
    });
    expect(fundraiserWriteRepository.createFundraiser).not.toHaveBeenCalled();
  });

  it("rejects community linkage when the selected community is not owned by the viewer", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const fundraiserWriteRepository = createFundraiserWriteRepositoryStub();
    const fundraiserCommunityOwnershipLookup =
      createFundraiserCommunityOwnershipLookupStub();

    const result = await createFundraiserCommand(
      {
        sessionViewerGateway,
        fundraiserWriteRepository,
        fundraiserCommunityOwnershipLookup,
      },
      {
        sessionToken: "demo-supporter-session",
        title: "Spring Pantry Drive",
        story: "Funding pantry deliveries through spring.",
        goalAmount: 18000,
        communitySlug: "neighbors-helping-neighbors",
      },
    );

    expect(result).toEqual({
      status: "forbidden",
      message: "You can only link a fundraiser to a community you own.",
    });
    expect(fundraiserWriteRepository.createFundraiser).not.toHaveBeenCalled();
  });

  it("creates fundraisers for authenticated viewers and links owned communities", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const fundraiserWriteRepository = createFundraiserWriteRepositoryStub({
      createdFundraiser: {
        id: "fundraiser_spring_pantry_drive",
        ownerUserId: "user_supporter_jordan",
        communityId: "community_jordan_garden_network",
        slug: "spring-pantry-drive",
        title: "Spring Pantry Drive",
        story: "Funding pantry deliveries through spring.",
        status: "active",
        goalAmount: 18000,
        createdAt: new Date("2026-03-18T16:00:00.000Z"),
      },
    });
    const fundraiserCommunityOwnershipLookup =
      createFundraiserCommunityOwnershipLookupStub({
        ownedCommunity: {
          id: "community_jordan_garden_network",
          slug: "jordan-garden-network",
          name: "Jordan Garden Network",
        },
      });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();

    const result = await createFundraiserCommand(
      {
        sessionViewerGateway,
        fundraiserWriteRepository,
        fundraiserCommunityOwnershipLookup,
        analyticsEventPublisher,
      },
      {
        sessionToken: "demo-supporter-session",
        title: "Spring Pantry Drive",
        story: "Funding pantry deliveries through spring.",
        goalAmount: 18000,
        communitySlug: "jordan-garden-network",
      },
    );

    expect(
      fundraiserWriteRepository.findFundraiserBySlugForCreation,
    ).toHaveBeenCalledWith("spring-pantry-drive");
    expect(
      fundraiserCommunityOwnershipLookup.findOwnedCommunityBySlugForFundraiser,
    ).toHaveBeenCalledWith("user_supporter_jordan", "jordan-garden-network");
    expect(fundraiserWriteRepository.createFundraiser).toHaveBeenCalledWith({
      ownerUserId: "user_supporter_jordan",
      communityId: "community_jordan_garden_network",
      slug: "spring-pantry-drive",
      title: "Spring Pantry Drive",
      story: "Funding pantry deliveries through spring.",
      status: "active",
      goalAmount: 18000,
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "fundraiser.created",
        payload: {
          viewerUserId: "user_supporter_jordan",
          fundraiserId: "fundraiser_spring_pantry_drive",
          fundraiserSlug: "spring-pantry-drive",
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
      fundraiser: {
        id: "fundraiser_spring_pantry_drive",
        slug: "spring-pantry-drive",
        title: "Spring Pantry Drive",
        story: "Funding pantry deliveries through spring.",
        status: "active",
        goalAmount: 18000,
        createdAt: "2026-03-18T16:00:00.000Z",
      },
      community: {
        slug: "jordan-garden-network",
        name: "Jordan Garden Network",
      },
    });
  });
});

const createSessionViewerGatewayStub = ({
  viewer = null,
}: {
  viewer?: Awaited<
    ReturnType<FundraiserSessionViewerGateway["findViewerBySessionToken"]>
  >;
} = {}): FundraiserSessionViewerGateway & {
  findViewerBySessionToken: ReturnType<typeof vi.fn>;
} => ({
  findViewerBySessionToken: vi.fn().mockResolvedValue(viewer),
});

const createFundraiserWriteRepositoryStub = ({
  existingFundraiser = null,
  createdFundraiser = {
    id: "fundraiser_created_default",
    ownerUserId: "user_supporter_jordan",
    communityId: null,
    slug: "fundraiser-created-default",
    title: "Fundraiser Created Default",
    story: "Default story",
    status: "active" as const,
    goalAmount: 10000,
    createdAt: new Date("2026-03-18T16:00:00.000Z"),
  },
}: {
  existingFundraiser?: Awaited<
    ReturnType<FundraiserWriteRepository["findFundraiserBySlugForCreation"]>
  >;
  createdFundraiser?: Awaited<
    ReturnType<FundraiserWriteRepository["createFundraiser"]>
  >;
} = {}): FundraiserWriteRepository & {
  findFundraiserBySlugForCreation: ReturnType<typeof vi.fn>;
  createFundraiser: ReturnType<typeof vi.fn>;
} => ({
  findFundraiserBySlugForCreation: vi.fn().mockResolvedValue(existingFundraiser),
  createFundraiser: vi.fn().mockResolvedValue(createdFundraiser),
});

const createFundraiserCommunityOwnershipLookupStub = ({
  ownedCommunity = null,
}: {
  ownedCommunity?: Awaited<
    ReturnType<
      FundraiserCommunityOwnershipLookup["findOwnedCommunityBySlugForFundraiser"]
    >
  >;
} = {}): FundraiserCommunityOwnershipLookup & {
  findOwnedCommunityBySlugForFundraiser: ReturnType<typeof vi.fn>;
} => ({
  findOwnedCommunityBySlugForFundraiser: vi.fn().mockResolvedValue(ownedCommunity),
});

const createAnalyticsEventPublisherStub = (): AnalyticsEventPublisher & {
  publish: ReturnType<typeof vi.fn>;
} => ({
  publish: vi.fn().mockResolvedValue(undefined),
});
