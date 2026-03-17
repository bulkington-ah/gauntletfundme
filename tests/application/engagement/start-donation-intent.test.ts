import {
  type AnalyticsEventPublisher,
  startDonationIntent,
  type DonationIntentTargetLookup,
  type DonationIntentWriteRepository,
  type SessionViewerGateway,
} from "@/application";

describe("startDonationIntent", () => {
  it("rejects invalid requests before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const donationIntentTargetLookup = createDonationIntentTargetLookupStub();
    const donationIntentWriteRepository = createDonationIntentWriteRepositoryStub();

    const result = await startDonationIntent(
      {
        sessionViewerGateway,
        donationIntentTargetLookup,
        donationIntentWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        fundraiserSlug: "warm-meals-2026",
        amount: 0,
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "amount must be a positive integer.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).not.toHaveBeenCalled();
    expect(
      donationIntentTargetLookup.findFundraiserBySlugForDonationIntent,
    ).not.toHaveBeenCalled();
    expect(donationIntentWriteRepository.createDonationIntent).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const donationIntentTargetLookup = createDonationIntentTargetLookupStub();
    const donationIntentWriteRepository = createDonationIntentWriteRepositoryStub();

    const result = await startDonationIntent(
      {
        sessionViewerGateway,
        donationIntentTargetLookup,
        donationIntentWriteRepository,
      },
      {
        sessionToken: null,
        fundraiserSlug: "warm-meals-2026",
        amount: 2500,
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message:
        "Authentication is required to start donation intents. Send the x-session-token header to continue.",
    });
    expect(
      donationIntentTargetLookup.findFundraiserBySlugForDonationIntent,
    ).not.toHaveBeenCalled();
    expect(donationIntentWriteRepository.createDonationIntent).not.toHaveBeenCalled();
  });

  it("returns not_found when fundraiser lookup fails", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const donationIntentTargetLookup = createDonationIntentTargetLookupStub();
    const donationIntentWriteRepository = createDonationIntentWriteRepositoryStub();

    const result = await startDonationIntent(
      {
        sessionViewerGateway,
        donationIntentTargetLookup,
        donationIntentWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        fundraiserSlug: "missing-fundraiser",
        amount: 2500,
      },
    );

    expect(result).toEqual({
      status: "not_found",
      message: 'No fundraiser was found for slug "missing-fundraiser".',
    });
    expect(donationIntentWriteRepository.createDonationIntent).not.toHaveBeenCalled();
  });

  it("creates a mocked donation intent for authenticated viewers", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const donationIntentTargetLookup = createDonationIntentTargetLookupStub({
      fundraiser: {
        id: "fundraiser_warm_meals_2026",
        slug: "warm-meals-2026",
      },
    });
    const donationIntentWriteRepository = createDonationIntentWriteRepositoryStub({
      donationIntent: {
        id: "intent_jordan_warm_meals_new",
        userId: "user_supporter_jordan",
        fundraiserId: "fundraiser_warm_meals_2026",
        amount: 2500,
        status: "started",
        createdAt: new Date("2026-03-16T16:00:00.000Z"),
      },
    });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();

    const result = await startDonationIntent(
      {
        sessionViewerGateway,
        donationIntentTargetLookup,
        donationIntentWriteRepository,
        analyticsEventPublisher,
      },
      {
        sessionToken: "demo-supporter-session",
        fundraiserSlug: "warm-meals-2026",
        amount: 2500,
      },
    );

    expect(donationIntentWriteRepository.createDonationIntent).toHaveBeenCalledWith({
      userId: "user_supporter_jordan",
      fundraiserId: "fundraiser_warm_meals_2026",
      amount: 2500,
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "engagement.donation_intent.started",
        payload: {
          viewerUserId: "user_supporter_jordan",
          fundraiserSlug: "warm-meals-2026",
          donationIntentId: "intent_jordan_warm_meals_new",
          amount: 2500,
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
        slug: "warm-meals-2026",
      },
      donationIntent: {
        id: "intent_jordan_warm_meals_new",
        amount: 2500,
        status: "started",
        createdAt: "2026-03-16T16:00:00.000Z",
      },
      mockedCheckout: true,
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

const createDonationIntentTargetLookupStub = ({
  fundraiser = null,
}: {
  fundraiser?: Awaited<
    ReturnType<DonationIntentTargetLookup["findFundraiserBySlugForDonationIntent"]>
  >;
} = {}): DonationIntentTargetLookup & {
  findFundraiserBySlugForDonationIntent: ReturnType<typeof vi.fn>;
} => ({
  findFundraiserBySlugForDonationIntent: vi.fn().mockResolvedValue(fundraiser),
});

const createDonationIntentWriteRepositoryStub = ({
  donationIntent = {
    id: "intent_default",
    userId: "user_supporter_jordan",
    fundraiserId: "fundraiser_warm_meals_2026",
    amount: 2500,
    status: "started" as const,
    createdAt: new Date("2026-03-16T16:00:00.000Z"),
  },
}: {
  donationIntent?: Awaited<
    ReturnType<DonationIntentWriteRepository["createDonationIntent"]>
  >;
} = {}): DonationIntentWriteRepository & {
  createDonationIntent: ReturnType<typeof vi.fn>;
} => ({
  createDonationIntent: vi.fn().mockResolvedValue(donationIntent),
});

const createAnalyticsEventPublisherStub = (): AnalyticsEventPublisher & {
  publish: ReturnType<typeof vi.fn>;
} => ({
  publish: vi.fn().mockResolvedValue(undefined),
});
