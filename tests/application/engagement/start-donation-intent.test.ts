import {
  type AnalyticsEventPublisher,
  submitDonation,
  type DonationTargetLookup,
  type DonationWriteRepository,
  type SessionViewerGateway,
} from "@/application";

describe("submitDonation", () => {
  it("rejects invalid requests before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const donationTargetLookup = createDonationTargetLookupStub();
    const donationWriteRepository = createDonationWriteRepositoryStub();

    const result = await submitDonation(
      {
        sessionViewerGateway,
        donationTargetLookup,
        donationWriteRepository,
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
    expect(donationTargetLookup.findFundraiserBySlugForDonation).not.toHaveBeenCalled();
    expect(donationWriteRepository.createDonation).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const donationTargetLookup = createDonationTargetLookupStub();
    const donationWriteRepository = createDonationWriteRepositoryStub();

    const result = await submitDonation(
      {
        sessionViewerGateway,
        donationTargetLookup,
        donationWriteRepository,
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
        "Authentication is required to submit donations. Send the x-session-token header to continue.",
    });
    expect(donationTargetLookup.findFundraiserBySlugForDonation).not.toHaveBeenCalled();
    expect(donationWriteRepository.createDonation).not.toHaveBeenCalled();
  });

  it("returns not_found when fundraiser lookup fails", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const donationTargetLookup = createDonationTargetLookupStub();
    const donationWriteRepository = createDonationWriteRepositoryStub();

    const result = await submitDonation(
      {
        sessionViewerGateway,
        donationTargetLookup,
        donationWriteRepository,
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
    expect(donationWriteRepository.createDonation).not.toHaveBeenCalled();
  });

  it("creates a completed donation for authenticated viewers", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const donationTargetLookup = createDonationTargetLookupStub({
      fundraiser: {
        id: "fundraiser_warm_meals_2026",
        slug: "warm-meals-2026",
      },
    });
    const donationWriteRepository = createDonationWriteRepositoryStub({
      donation: {
        id: "intent_jordan_warm_meals_new",
        userId: "user_supporter_jordan",
        fundraiserId: "fundraiser_warm_meals_2026",
        amount: 2500,
        status: "completed",
        createdAt: new Date("2026-03-16T16:00:00.000Z"),
      },
    });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();

    const result = await submitDonation(
      {
        sessionViewerGateway,
        donationTargetLookup,
        donationWriteRepository,
        analyticsEventPublisher,
      },
      {
        sessionToken: "demo-supporter-session",
        fundraiserSlug: "warm-meals-2026",
        amount: 2500,
      },
    );

    expect(donationWriteRepository.createDonation).toHaveBeenCalledWith({
      userId: "user_supporter_jordan",
      fundraiserId: "fundraiser_warm_meals_2026",
      amount: 2500,
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "engagement.donation.completed",
        payload: {
          viewerUserId: "user_supporter_jordan",
          fundraiserSlug: "warm-meals-2026",
          donationId: "intent_jordan_warm_meals_new",
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
      donation: {
        id: "intent_jordan_warm_meals_new",
        amount: 2500,
        status: "completed",
        createdAt: "2026-03-16T16:00:00.000Z",
      },
      mockedPaymentProcessor: true,
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

const createDonationTargetLookupStub = ({
  fundraiser = null,
}: {
  fundraiser?: Awaited<
    ReturnType<DonationTargetLookup["findFundraiserBySlugForDonation"]>
  >;
} = {}): DonationTargetLookup & {
  findFundraiserBySlugForDonation: ReturnType<typeof vi.fn>;
} => ({
  findFundraiserBySlugForDonation: vi.fn().mockResolvedValue(fundraiser),
});

const createDonationWriteRepositoryStub = ({
  donation = {
    id: "intent_default",
    userId: "user_supporter_jordan",
    fundraiserId: "fundraiser_warm_meals_2026",
    amount: 2500,
    status: "completed" as const,
    createdAt: new Date("2026-03-16T16:00:00.000Z"),
  },
}: {
  donation?: Awaited<
    ReturnType<DonationWriteRepository["createDonation"]>
  >;
} = {}): DonationWriteRepository & {
  createDonation: ReturnType<typeof vi.fn>;
} => ({
  createDonation: vi.fn().mockResolvedValue(donation),
});

const createAnalyticsEventPublisherStub = (): AnalyticsEventPublisher & {
  publish: ReturnType<typeof vi.fn>;
} => ({
  publish: vi.fn().mockResolvedValue(undefined),
});
