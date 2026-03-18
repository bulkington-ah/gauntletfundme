import {
  getSupporterDigest,
  refreshSupporterDigestNarration,
  recordDigestView,
  type AnalyticsEventPublisher,
  type SessionViewerGateway,
  type SupporterDigestNarrator,
  type SupporterDigestReadRepository,
  type SupporterDigestStateRepository,
} from "@/application";

describe("supporter digest application flows", () => {
  it("returns unauthorized when a digest viewer cannot be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: null,
    });

    const result = await getSupporterDigest(
      {
        sessionViewerGateway,
        supporterDigestReadRepository: createSupporterDigestReadRepositoryStub(),
        supporterDigestStateRepository: createSupporterDigestStateRepositoryStub(),
      },
      {
        sessionToken: null,
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message: "Authentication is required to view your digest.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).toHaveBeenCalledWith(null);
  });

  it("uses a bounded first-time digest window when no digest state exists", async () => {
    const now = new Date("2026-03-18T12:00:00.000Z");
    const supporterDigestReadRepository = createSupporterDigestReadRepositoryStub({
      baseline: {
        viewerCreatedAt: new Date("2026-03-01T09:00:00.000Z"),
      },
    });

    const result = await getSupporterDigest(
      {
        now: () => now,
        sessionViewerGateway: createSessionViewerGatewayStub(),
        supporterDigestReadRepository,
        supporterDigestStateRepository: createSupporterDigestStateRepositoryStub(),
      },
      {
        sessionToken: "demo-supporter-session",
      },
    );

    expect(result.status).toBe("success");
    if (result.status !== "success") {
      throw new Error("Expected a successful digest result.");
    }

    expect(result.digest.windowStart).toBe("2026-03-11T12:00:00.000Z");
    expect(
      supporterDigestReadRepository.listSupporterDigestFundraiserActivity.mock.calls[0]?.[0],
    ).toMatchObject({
      userId: "user_supporter_jordan",
      windowStart: new Date("2026-03-11T12:00:00.000Z"),
      windowEnd: now,
    });
    expect(result.digest.highlights).toEqual([]);
  });

  it("uses persisted digest state and returns deterministic highlights immediately", async () => {
    const now = new Date("2026-03-18T12:00:00.000Z");
    const supporterDigestReadRepository = createSupporterDigestReadRepositoryStub({
      statefulCommunityUpdates: [
        {
          communityId: "community_neighbors_helping_neighbors",
          communitySlug: "neighbors-helping-neighbors",
          communityName: "Neighbors Helping Neighbors",
          organizerDisplayName: "Avery Johnson",
          postId: "post_evening_update",
          postTitle: "Evening prep shift",
          publishedAt: new Date("2026-03-18T10:30:00.000Z"),
        },
      ],
    });
    const result = await getSupporterDigest(
      {
        now: () => now,
        sessionViewerGateway: createSessionViewerGatewayStub(),
        supporterDigestReadRepository,
        supporterDigestStateRepository: createSupporterDigestStateRepositoryStub({
          state: {
            lastViewedAt: new Date("2026-03-17T18:00:00.000Z"),
          },
        }),
      },
      {
        sessionToken: "demo-supporter-session",
      },
    );

    expect(result.status).toBe("success");
    if (result.status !== "success") {
      throw new Error("Expected a successful digest result.");
    }

    expect(result.digest.windowStart).toBe("2026-03-17T18:00:00.000Z");
    expect(result.digest.generationMode).toBe("deterministic");
    expect(result.digest.narration).toEqual({
      status: "pending",
      reason: null,
    });
    expect(result.digest.highlights).toEqual([
      expect.objectContaining({
        id: "community_update:post_evening_update",
        headline:
          "Avery Johnson posted a new update in Neighbors Helping Neighbors.",
        body:
          "\"Evening prep shift\" is a fresh organizer update in Neighbors Helping Neighbors.",
        ctaLabel: "Read update",
        href: "/communities/neighbors-helping-neighbors#post-post_evening_update",
      }),
    ]);
  });

  it("refreshes a digest window with narrated OpenAI copy when available", async () => {
    const supporterDigestNarrator = createSupporterDigestNarratorStub({
      result: {
        status: "success",
        items: [
          {
            candidateId: "community_update:post_evening_update",
            headline: "Avery shared a fresh organizer update.",
            body:
              "The neighbors community has a new evening prep shift update ready to read.",
            ctaLabel: "Read update",
          },
        ],
      },
    });

    const result = await refreshSupporterDigestNarration(
      {
        analyticsEventPublisher: createAnalyticsEventPublisherStub(),
        sessionViewerGateway: createSessionViewerGatewayStub(),
        supporterDigestNarrator,
        supporterDigestReadRepository: createSupporterDigestReadRepositoryStub({
          statefulCommunityUpdates: [
            {
              communityId: "community_neighbors_helping_neighbors",
              communitySlug: "neighbors-helping-neighbors",
              communityName: "Neighbors Helping Neighbors",
              organizerDisplayName: "Avery Johnson",
              postId: "post_evening_update",
              postTitle: "Evening prep shift",
              publishedAt: new Date("2026-03-18T10:30:00.000Z"),
            },
          ],
        }),
      },
      {
        sessionToken: "demo-supporter-session",
        windowStart: "2026-03-17T18:00:00.000Z",
        windowEnd: "2026-03-18T12:00:00.000Z",
      },
    );

    expect(result.status).toBe("success");
    if (result.status !== "success") {
      throw new Error("Expected a successful digest refresh result.");
    }

    expect(result.digest.generationMode).toBe("openai");
    expect(result.digest.narration).toEqual({
      status: "completed",
      reason: null,
    });
    expect(result.digest.highlights).toEqual([
      expect.objectContaining({
        id: "community_update:post_evening_update",
        headline: "Avery shared a fresh organizer update.",
        body:
          "The neighbors community has a new evening prep shift update ready to read.",
        ctaLabel: "Read update",
      }),
    ]);
    expect(supporterDigestNarrator.narrateDigest).toHaveBeenCalledWith({
      viewerUserId: "user_supporter_jordan",
      windowStart: new Date("2026-03-17T18:00:00.000Z"),
      windowEnd: new Date("2026-03-18T12:00:00.000Z"),
      highlights: expect.arrayContaining([
        expect.objectContaining({
          id: "community_update:post_evening_update",
        }),
      ]),
    });
  });

  it("falls back to deterministic copy during narration refresh when OpenAI is unavailable", async () => {
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();

    const result = await refreshSupporterDigestNarration(
      {
        analyticsEventPublisher,
        sessionViewerGateway: createSessionViewerGatewayStub(),
        supporterDigestNarrator: createSupporterDigestNarratorStub({
          result: {
            status: "unavailable",
            reason: "provider_error",
            message: "OpenAI is temporarily unavailable.",
          },
        }),
        supporterDigestReadRepository: createSupporterDigestReadRepositoryStub({
          fundraiserActivity: [
            {
              fundraiserId: "fundraiser_warm_meals_2026",
              fundraiserSlug: "warm-meals-2026",
              fundraiserTitle: "Warm Meals 2026",
              goalAmount: 250000,
              amountRaisedBeforeWindow: 22000,
              amountRaisedAfterWindow: 30500,
              newDonationCount: 2,
              newAmountRaised: 8500,
              newSupporterCount: 2,
              lastDonationAt: new Date("2026-03-18T11:30:00.000Z"),
            },
          ],
        }),
      },
      {
        sessionToken: "demo-supporter-session",
        windowStart: "2026-03-17T18:00:00.000Z",
        windowEnd: "2026-03-18T12:00:00.000Z",
      },
    );

    expect(result.status).toBe("success");
    if (result.status !== "success") {
      throw new Error("Expected a successful digest result.");
    }

    expect(result.digest.generationMode).toBe("deterministic");
    expect(result.digest.narration).toEqual({
      status: "unavailable",
      reason: "provider_error",
    });
    expect(result.digest.highlights[0]).toMatchObject({
      id: "fundraiser_momentum:fundraiser_warm_meals_2026",
      headline: "Warm Meals 2026 picked up momentum.",
      ctaLabel: "Support fundraiser",
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "supporter_digest.rendered_fallback",
        payload: {
          viewerUserId: "user_supporter_jordan",
          highlightCount: 1,
        },
      }),
    );
    expect(analyticsEventPublisher.publish).not.toHaveBeenCalledWith(
      expect.objectContaining({
        name: "page_view.supporter_digest",
      }),
    );
  });

  it("rejects invalid narration refresh windows before calling OpenAI", async () => {
    const supporterDigestNarrator = createSupporterDigestNarratorStub();

    const result = await refreshSupporterDigestNarration(
      {
        sessionViewerGateway: createSessionViewerGatewayStub(),
        supporterDigestNarrator,
        supporterDigestReadRepository: createSupporterDigestReadRepositoryStub(),
      },
      {
        sessionToken: "demo-supporter-session",
        windowStart: "not-a-date",
        windowEnd: "2026-03-18T12:00:00.000Z",
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "windowStart must be a valid ISO-8601 timestamp.",
    });
    expect(supporterDigestNarrator.narrateDigest).not.toHaveBeenCalled();
  });

  it("records digest acknowledgements only for authorized viewers with valid timestamps", async () => {
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();
    const supporterDigestStateRepository = createSupporterDigestStateRepositoryStub();

    const invalidResult = await recordDigestView(
      {
        now: () => new Date("2026-03-18T12:00:00.000Z"),
        analyticsEventPublisher,
        sessionViewerGateway: createSessionViewerGatewayStub(),
        supporterDigestStateRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        viewedThrough: "2026-03-18T12:10:01.000Z",
      },
    );

    expect(invalidResult).toEqual({
      status: "invalid_request",
      message: "viewedThrough cannot be substantially in the future.",
    });
    expect(
      supporterDigestStateRepository.recordSupporterDigestView,
    ).not.toHaveBeenCalled();

    const successResult = await recordDigestView(
      {
        now: () => new Date("2026-03-18T12:00:00.000Z"),
        analyticsEventPublisher,
        sessionViewerGateway: createSessionViewerGatewayStub(),
        supporterDigestStateRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        viewedThrough: "2026-03-18T12:04:00.000Z",
      },
    );

    expect(successResult).toEqual({
      status: "success",
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      viewedThrough: "2026-03-18T12:04:00.000Z",
    });
    expect(
      supporterDigestStateRepository.recordSupporterDigestView,
    ).toHaveBeenCalledWith({
      userId: "user_supporter_jordan",
      viewedThrough: new Date("2026-03-18T12:04:00.000Z"),
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "supporter_digest.acknowledged",
        payload: {
          viewerUserId: "user_supporter_jordan",
          viewedThrough: "2026-03-18T12:04:00.000Z",
        },
      }),
    );
  });
});

const createSessionViewerGatewayStub = ({
  viewer = {
    userId: "user_supporter_jordan",
    role: "supporter" as const,
  },
}: {
  viewer?: Awaited<ReturnType<SessionViewerGateway["findViewerBySessionToken"]>>;
} = {}): SessionViewerGateway & {
  findViewerBySessionToken: ReturnType<typeof vi.fn>;
} => ({
  findViewerBySessionToken: vi.fn().mockResolvedValue(viewer),
});

const createSupporterDigestReadRepositoryStub = ({
  baseline = {
    viewerCreatedAt: new Date("2026-03-16T08:05:00.000Z"),
  },
  fundraiserActivity = [],
  statefulCommunityUpdates = [],
  discussionBursts = [],
}: {
  baseline?: Awaited<
    ReturnType<SupporterDigestReadRepository["findSupporterDigestViewerBaseline"]>
  >;
  fundraiserActivity?: Awaited<
    ReturnType<SupporterDigestReadRepository["listSupporterDigestFundraiserActivity"]>
  >;
  statefulCommunityUpdates?: Awaited<
    ReturnType<SupporterDigestReadRepository["listSupporterDigestCommunityUpdates"]>
  >;
  discussionBursts?: Awaited<
    ReturnType<SupporterDigestReadRepository["listSupporterDigestDiscussionBursts"]>
  >;
} = {}): SupporterDigestReadRepository & {
  findSupporterDigestViewerBaseline: ReturnType<typeof vi.fn>;
  listSupporterDigestFundraiserActivity: ReturnType<typeof vi.fn>;
  listSupporterDigestCommunityUpdates: ReturnType<typeof vi.fn>;
  listSupporterDigestDiscussionBursts: ReturnType<typeof vi.fn>;
} => ({
  findSupporterDigestViewerBaseline: vi.fn().mockResolvedValue(baseline),
  listSupporterDigestFundraiserActivity: vi.fn().mockResolvedValue(
    fundraiserActivity,
  ),
  listSupporterDigestCommunityUpdates: vi.fn().mockResolvedValue(
    statefulCommunityUpdates,
  ),
  listSupporterDigestDiscussionBursts: vi.fn().mockResolvedValue(
    discussionBursts,
  ),
});

const createSupporterDigestStateRepositoryStub = ({
  state = null,
}: {
  state?: Awaited<
    ReturnType<SupporterDigestStateRepository["findSupporterDigestStateByUserId"]>
  >;
} = {}): SupporterDigestStateRepository & {
  findSupporterDigestStateByUserId: ReturnType<typeof vi.fn>;
  recordSupporterDigestView: ReturnType<typeof vi.fn>;
} => ({
  findSupporterDigestStateByUserId: vi.fn().mockResolvedValue(state),
  recordSupporterDigestView: vi.fn().mockResolvedValue(undefined),
});

const createSupporterDigestNarratorStub = ({
  result = {
    status: "success" as const,
    items: [],
  },
}: {
  result?: Awaited<ReturnType<SupporterDigestNarrator["narrateDigest"]>>;
} = {}): SupporterDigestNarrator & {
  narrateDigest: ReturnType<typeof vi.fn>;
} => ({
  narrateDigest: vi.fn().mockResolvedValue(result),
});

const createAnalyticsEventPublisherStub = (): AnalyticsEventPublisher & {
  publish: ReturnType<typeof vi.fn>;
} => ({
  publish: vi.fn().mockResolvedValue(undefined),
});
