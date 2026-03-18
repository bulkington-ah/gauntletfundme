import {
  type AnalyticsEventPublisher,
  getPublicProfileSlugByUserId,
  getPublicCommunityBySlug,
  getPublicFundraiserBySlug,
  getPublicProfileBySlug,
  listPublicCommunities,
  listPublicFundraisers,
  type PublicCommunitySnapshot,
  type PublicCommunitySummarySnapshot,
  type PublicContentReadRepository,
  type PublicFundraiserSnapshot,
  type PublicFundraiserSummarySnapshot,
  type PublicProfileSnapshot,
} from "@/application";
import {
  createComment,
  createCommunity,
  createDonation,
  createFundraiser,
  createPost,
  createUser,
  createUserProfile,
} from "@/domain";

const createdAt = new Date("2026-03-16T12:00:00.000Z");

describe("public content queries", () => {
  it("normalizes the profile slug, queries the repository, and maps a response DTO", async () => {
    const findProfileBySlug = vi.fn<
      PublicContentReadRepository["findProfileBySlug"]
    >();
    const repository = createRepositoryStub({
      findProfileBySlug,
    });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();
    const snapshot: PublicProfileSnapshot = {
      user: createUser({
        id: "user_123",
        email: "avery@example.com",
        displayName: "Avery Johnson",
        role: "organizer",
        createdAt,
      }),
      profile: createUserProfile({
        id: "profile_123",
        userId: "user_123",
        slug: "avery-johnson",
        bio: "Organizer building community support.",
        avatarUrl: "https://example.com/avery.png",
        profileType: "organizer",
        createdAt,
      }),
      followerCount: 4,
      followingCount: 2,
      inspiredSupporterCount: 5,
      featuredFundraisers: [
        {
          fundraiser: createFundraiser({
            id: "fundraiser_123",
            ownerUserId: "user_123",
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            story: "Funding hot meals.",
            status: "active",
            goalAmount: 250000,
            createdAt,
          }),
          owner: createUser({
            id: "user_123",
            email: "avery@example.com",
            displayName: "Avery Johnson",
            role: "organizer",
            createdAt,
          }),
          ownerProfile: createUserProfile({
            id: "profile_123",
            userId: "user_123",
            slug: "avery-johnson",
            bio: "Organizer building community support.",
            avatarUrl: "https://example.com/avery.png",
            profileType: "organizer",
            createdAt,
          }),
          relatedCommunity: createCommunity({
            id: "community_123",
            ownerUserId: "user_123",
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            description: "Volunteer coordination and updates.",
            visibility: "public",
            createdAt,
          }),
          amountRaised: 12500,
          supporterCount: 3,
          donationCount: 4,
        },
      ],
      ownedCommunities: [
        createCommunity({
          id: "community_123",
          ownerUserId: "user_123",
          slug: "neighbors-helping-neighbors",
          name: "Neighbors Helping Neighbors",
          description: "Volunteer coordination and updates.",
          visibility: "public",
          createdAt,
        }),
      ],
      recentActivity: [
        {
          type: "fundraiser_donation",
          actor: {
            user: createUser({
              id: "user_456",
              email: "jordan@example.com",
              displayName: "Jordan Lee",
              role: "supporter",
              createdAt,
            }),
            profile: createUserProfile({
              id: "profile_456",
              userId: "user_456",
              slug: "jordan-lee",
              bio: "Supporter",
              avatarUrl: null,
              profileType: "supporter",
              createdAt,
            }),
          },
          fundraiser: {
            fundraiser: createFundraiser({
              id: "fundraiser_123",
              ownerUserId: "user_123",
              slug: "warm-meals-2026",
              title: "Warm Meals 2026",
              story: "Funding hot meals.",
              status: "active",
              goalAmount: 250000,
              createdAt,
            }),
            owner: createUser({
              id: "user_123",
              email: "avery@example.com",
              displayName: "Avery Johnson",
              role: "organizer",
              createdAt,
            }),
            ownerProfile: createUserProfile({
              id: "profile_123",
              userId: "user_123",
              slug: "avery-johnson",
              bio: "Organizer building community support.",
              avatarUrl: "https://example.com/avery.png",
              profileType: "organizer",
              createdAt,
            }),
            relatedCommunity: createCommunity({
              id: "community_123",
              ownerUserId: "user_123",
              slug: "neighbors-helping-neighbors",
              name: "Neighbors Helping Neighbors",
              description: "Volunteer coordination and updates.",
              visibility: "public",
              createdAt,
            }),
            amountRaised: 12500,
            supporterCount: 3,
            donationCount: 4,
          },
          community: createCommunity({
            id: "community_123",
            ownerUserId: "user_123",
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            description: "Volunteer coordination and updates.",
            visibility: "public",
            createdAt,
          }),
          donation: createDonation({
            id: "intent_123",
            userId: "user_456",
            fundraiserId: "fundraiser_123",
            amount: 4200,
            status: "completed",
            createdAt,
          }),
        },
        {
          type: "community_post",
          actor: {
            user: createUser({
              id: "user_123",
              email: "avery@example.com",
              displayName: "Avery Johnson",
              role: "organizer",
              createdAt,
            }),
            profile: createUserProfile({
              id: "profile_123",
              userId: "user_123",
              slug: "avery-johnson",
              bio: "Organizer building community support.",
              avatarUrl: "https://example.com/avery.png",
              profileType: "organizer",
              createdAt,
            }),
          },
          community: createCommunity({
            id: "community_123",
            ownerUserId: "user_123",
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            description: "Volunteer coordination and updates.",
            visibility: "public",
            createdAt,
          }),
          post: createPost({
            id: "post_123",
            communityId: "community_123",
            authorUserId: "user_123",
            title: "Kitchen kickoff update",
            body: "Meal prep starts Saturday.",
            status: "published",
            moderationStatus: "visible",
            createdAt: new Date("2026-03-16T12:05:00.000Z"),
          }),
        },
      ],
    };

    findProfileBySlug.mockResolvedValue(snapshot);

    const result = await getPublicProfileBySlug(
      { publicContentReadRepository: repository, analyticsEventPublisher },
      { slug: " Avery Johnson " },
    );

    expect(findProfileBySlug).toHaveBeenCalledWith("avery-johnson");
    expect(result).toEqual({
      status: "success",
      data: {
        kind: "profile",
        profile: {
          slug: "avery-johnson",
          displayName: "Avery Johnson",
          role: "organizer",
          profileType: "organizer",
          bio: "Organizer building community support.",
          avatarUrl: "https://example.com/avery.png",
          followerCount: 4,
          followingCount: 2,
          inspiredSupporterCount: 5,
        },
        connections: {
          fundraisers: [
            {
              slug: "warm-meals-2026",
              title: "Warm Meals 2026",
              status: "active",
              goalAmount: 250000,
              amountRaised: 12500,
              supporterCount: 3,
              donationCount: 4,
            },
          ],
          communities: [
            {
              slug: "neighbors-helping-neighbors",
              name: "Neighbors Helping Neighbors",
              visibility: "public",
            },
          ],
        },
        recentActivity: [
          {
            id: "intent_123",
            type: "fundraiser_donation",
            actor: {
              displayName: "Jordan Lee",
              profileSlug: "jordan-lee",
              avatarUrl: null,
            },
            createdAt: createdAt.toISOString(),
            summary: "Jordan Lee donated",
            detail: "Warm Meals 2026",
            fundraiser: {
              slug: "warm-meals-2026",
              title: "Warm Meals 2026",
              status: "active",
              goalAmount: 250000,
              amountRaised: 12500,
              supporterCount: 3,
              donationCount: 4,
            },
            community: {
              slug: "neighbors-helping-neighbors",
              name: "Neighbors Helping Neighbors",
              visibility: "public",
            },
            amount: 4200,
          },
          {
            id: "post_123",
            type: "community_post",
            actor: {
              displayName: "Avery Johnson",
              profileSlug: "avery-johnson",
              avatarUrl: "https://example.com/avery.png",
            },
            createdAt: "2026-03-16T12:05:00.000Z",
            summary: "Kitchen kickoff update",
            detail: "Meal prep starts Saturday.",
            fundraiser: null,
            community: {
              slug: "neighbors-helping-neighbors",
              name: "Neighbors Helping Neighbors",
              visibility: "public",
            },
            amount: null,
          },
        ],
      },
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "page_view.profile",
        payload: {
          profileSlug: "avery-johnson",
        },
      }),
    );
  });

  it("returns an invalid request result when the fundraiser slug is blank", async () => {
    const repository = createRepositoryStub();

    const result = await getPublicFundraiserBySlug(
      { publicContentReadRepository: repository },
      { slug: "   " },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "slug is required.",
    });
  });

  it("lists fundraisers with active campaigns first and then by support momentum", async () => {
    const listFundraisersRepository = vi.fn<
      PublicContentReadRepository["listFundraisers"]
    >();
    const repository = createRepositoryStub({
      listFundraisers: listFundraisersRepository,
    });
    const owner = createUser({
      id: "user_123",
      email: "avery@example.com",
      displayName: "Avery Johnson",
      role: "organizer",
      createdAt,
    });
    const ownerProfile = createUserProfile({
      id: "profile_123",
      userId: owner.id,
      slug: "avery-johnson",
      bio: "Organizer building community support.",
      avatarUrl: "https://example.com/avery.png",
      profileType: "organizer",
      createdAt,
    });
    const community = createCommunity({
      id: "community_123",
      ownerUserId: owner.id,
      slug: "neighbors-helping-neighbors",
      name: "Neighbors Helping Neighbors",
      description: "Volunteer coordination and updates.",
      visibility: "public",
      createdAt,
    });

    listFundraisersRepository.mockResolvedValue([
      createFundraiserSummarySnapshot({
        fundraiser: createFundraiser({
          id: "fundraiser_draft",
          ownerUserId: owner.id,
          slug: "future-drive",
          title: "Future Drive",
          story:
            "Planning the next big drive with plenty of prep work and a lot of volunteer coordination ahead.",
          status: "draft",
          goalAmount: 300000,
          createdAt: new Date("2026-03-16T14:00:00.000Z"),
        }),
        owner,
        ownerProfile,
        relatedCommunity: community,
        amountRaised: 99000,
        supporterCount: 40,
        donationCount: 55,
      }),
      createFundraiserSummarySnapshot({
        fundraiser: createFundraiser({
          id: "fundraiser_active_low",
          ownerUserId: owner.id,
          slug: "coat-drive",
          title: "Coat Drive",
          story: "Funding warm coats for winter weather support.",
          status: "active",
          goalAmount: 120000,
          createdAt: new Date("2026-03-16T11:00:00.000Z"),
        }),
        owner,
        ownerProfile,
        relatedCommunity: community,
        amountRaised: 6100,
        supporterCount: 2,
        donationCount: 2,
      }),
      createFundraiserSummarySnapshot({
        fundraiser: createFundraiser({
          id: "fundraiser_active_high",
          ownerUserId: owner.id,
          slug: "warm-meals-2026",
          title: "Warm Meals 2026",
          story:
            "Funding weekly hot meal deliveries and pantry restocks for families across the neighborhood with evening volunteer support included.",
          status: "active",
          goalAmount: 250000,
          createdAt: new Date("2026-03-16T12:00:00.000Z"),
        }),
        owner,
        ownerProfile,
        relatedCommunity: community,
        amountRaised: 12600,
        supporterCount: 3,
        donationCount: 4,
      }),
    ]);

    const result = await listPublicFundraisers({
      publicContentReadRepository: repository,
    });

    expect(result).toEqual({
      kind: "fundraiser_list",
      fundraisers: [
        {
          slug: "warm-meals-2026",
          title: "Warm Meals 2026",
          status: "active",
          goalAmount: 250000,
          amountRaised: 12600,
          supporterCount: 3,
          donationCount: 4,
          storyExcerpt:
            "Funding weekly hot meal deliveries and pantry restocks for families across the neighborhood with evening volunteer support included.",
          organizer: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: "https://example.com/avery.png",
          },
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
          },
        },
        {
          slug: "coat-drive",
          title: "Coat Drive",
          status: "active",
          goalAmount: 120000,
          amountRaised: 6100,
          supporterCount: 2,
          donationCount: 2,
          storyExcerpt: "Funding warm coats for winter weather support.",
          organizer: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: "https://example.com/avery.png",
          },
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
          },
        },
        {
          slug: "future-drive",
          title: "Future Drive",
          status: "draft",
          goalAmount: 300000,
          amountRaised: 99000,
          supporterCount: 40,
          donationCount: 55,
          storyExcerpt:
            "Planning the next big drive with plenty of prep work and a lot of volunteer coordination ahead.",
          organizer: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: "https://example.com/avery.png",
          },
          community: {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
          },
        },
      ],
    });
  });

  it("lists communities by follower count and then by recency", async () => {
    const listCommunitiesRepository = vi.fn<
      PublicContentReadRepository["listCommunities"]
    >();
    const repository = createRepositoryStub({
      listCommunities: listCommunitiesRepository,
    });
    const owner = createUser({
      id: "user_123",
      email: "avery@example.com",
      displayName: "Avery Johnson",
      role: "organizer",
      createdAt,
    });
    const ownerProfile = createUserProfile({
      id: "profile_123",
      userId: owner.id,
      slug: "avery-johnson",
      bio: "Organizer building community support.",
      avatarUrl: "https://example.com/avery.png",
      profileType: "organizer",
      createdAt,
    });

    listCommunitiesRepository.mockResolvedValue([
      createCommunitySummarySnapshot({
        community: createCommunity({
          id: "community_old",
          ownerUserId: owner.id,
          slug: "neighbors-helping-neighbors",
          name: "Neighbors Helping Neighbors",
          description: "Volunteer coordination and updates.",
          visibility: "public",
          createdAt: new Date("2026-03-16T09:30:00.000Z"),
        }),
        owner,
        ownerProfile,
        followerCount: 4,
        fundraiserCount: 4,
      }),
      createCommunitySummarySnapshot({
        community: createCommunity({
          id: "community_newer",
          ownerUserId: owner.id,
          slug: "weekend-pantry-crew",
          name: "Weekend Pantry Crew",
          description: "Pantry packing, delivery help, and same-day volunteer asks.",
          visibility: "public",
          createdAt: new Date("2026-03-16T09:40:00.000Z"),
        }),
        owner,
        ownerProfile,
        followerCount: 4,
        fundraiserCount: 4,
      }),
      createCommunitySummarySnapshot({
        community: createCommunity({
          id: "community_low_followers",
          ownerUserId: owner.id,
          slug: "school-success-network",
          name: "School Success Network",
          description: "Backpack drives, school support, and family updates.",
          visibility: "public",
          createdAt: new Date("2026-03-16T09:50:00.000Z"),
        }),
        owner,
        ownerProfile,
        followerCount: 2,
        fundraiserCount: 4,
      }),
    ]);

    const result = await listPublicCommunities({
      publicContentReadRepository: repository,
    });

    expect(result).toEqual({
      kind: "community_list",
      communities: [
        {
          slug: "weekend-pantry-crew",
          name: "Weekend Pantry Crew",
          visibility: "public",
          description: "Pantry packing, delivery help, and same-day volunteer asks.",
          followerCount: 4,
          fundraiserCount: 4,
          owner: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: "https://example.com/avery.png",
          },
        },
        {
          slug: "neighbors-helping-neighbors",
          name: "Neighbors Helping Neighbors",
          visibility: "public",
          description: "Volunteer coordination and updates.",
          followerCount: 4,
          fundraiserCount: 4,
          owner: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: "https://example.com/avery.png",
          },
        },
        {
          slug: "school-success-network",
          name: "School Success Network",
          visibility: "public",
          description: "Backpack drives, school support, and family updates.",
          followerCount: 2,
          fundraiserCount: 4,
          owner: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: "https://example.com/avery.png",
          },
        },
      ],
    });
  });

  it("resolves a public profile slug by user id", async () => {
    const findProfileSlugByUserId = vi.fn<
      PublicContentReadRepository["findProfileSlugByUserId"]
    >();
    const repository = createRepositoryStub({
      findProfileSlugByUserId,
    });

    findProfileSlugByUserId.mockResolvedValue("avery-johnson");

    await expect(
      getPublicProfileSlugByUserId(
        { publicContentReadRepository: repository },
        "user_123",
      ),
    ).resolves.toBe("avery-johnson");
    expect(findProfileSlugByUserId).toHaveBeenCalledWith("user_123");
  });

  it("maps fundraiser organizer and community context from the repository snapshot", async () => {
    const findFundraiserBySlug = vi.fn<
      PublicContentReadRepository["findFundraiserBySlug"]
    >();
    const repository = createRepositoryStub({
      findFundraiserBySlug,
    });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();
    const owner = createUser({
      id: "user_123",
      email: "avery@example.com",
      displayName: "Avery Johnson",
      role: "organizer",
      createdAt,
    });
    const fundraiser = createFundraiser({
      id: "fundraiser_123",
      ownerUserId: owner.id,
      slug: "warm-meals-2026",
      title: "Warm Meals 2026",
      story: "Funding hot meals.",
      status: "active",
      goalAmount: 250000,
      createdAt,
    });
    const snapshot: PublicFundraiserSnapshot = {
      summary: {
        fundraiser,
        owner,
        ownerProfile: createUserProfile({
          id: "profile_123",
          userId: owner.id,
          slug: "avery-johnson",
          bio: "Organizer building community support.",
          avatarUrl: "https://example.com/avery.png",
          profileType: "organizer",
          createdAt,
        }),
        relatedCommunity: createCommunity({
          id: "community_123",
          ownerUserId: owner.id,
          slug: "neighbors-helping-neighbors",
          name: "Neighbors Helping Neighbors",
          description: "Volunteer coordination and updates.",
          visibility: "public",
          createdAt,
        }),
        donationCount: 2,
        supporterCount: 2,
        amountRaised: 7800,
      },
      recentDonations: [
        {
          actor: {
            user: createUser({
              id: "user_456",
              email: "jordan@example.com",
              displayName: "Jordan Lee",
              role: "supporter",
              createdAt,
            }),
            profile: createUserProfile({
              id: "profile_456",
              userId: "user_456",
              slug: "jordan-lee",
              bio: "Supporter",
              avatarUrl: null,
              profileType: "supporter",
              createdAt,
            }),
          },
          donation: createDonation({
            id: "intent_456",
            userId: "user_456",
            fundraiserId: "fundraiser_123",
            amount: 5300,
            status: "completed",
            createdAt,
          }),
        },
      ],
    };

    findFundraiserBySlug.mockResolvedValue(snapshot);

    const result = await getPublicFundraiserBySlug(
      { publicContentReadRepository: repository, analyticsEventPublisher },
      { slug: " warm meals 2026 " },
    );

    expect(findFundraiserBySlug).toHaveBeenCalledWith("warm-meals-2026");
    expect(result).toEqual({
      status: "success",
      data: {
        kind: "fundraiser",
        fundraiser: {
          slug: "warm-meals-2026",
          title: "Warm Meals 2026",
          story: "Funding hot meals.",
          status: "active",
          goalAmount: 250000,
          amountRaised: 7800,
          supporterCount: 2,
          donationCount: 2,
        },
        organizer: {
          displayName: "Avery Johnson",
          role: "organizer",
          profileSlug: "avery-johnson",
          avatarUrl: "https://example.com/avery.png",
        },
        community: {
          slug: "neighbors-helping-neighbors",
          name: "Neighbors Helping Neighbors",
          visibility: "public",
        },
        recentDonations: [
          {
            displayName: "Jordan Lee",
            profileSlug: "jordan-lee",
            avatarUrl: null,
            amount: 5300,
            status: "completed",
            createdAt: createdAt.toISOString(),
          },
        ],
      },
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "page_view.fundraiser",
        payload: {
          fundraiserSlug: "warm-meals-2026",
        },
      }),
    );
  });

  it("maps community discussion from the repository snapshot", async () => {
    const findCommunityBySlug = vi.fn<
      PublicContentReadRepository["findCommunityBySlug"]
    >();
    const repository = createRepositoryStub({
      findCommunityBySlug,
    });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();
    const owner = createUser({
      id: "user_123",
      email: "avery@example.com",
      displayName: "Avery Johnson",
      role: "organizer",
      createdAt,
    });
    const supporter = createUser({
      id: "user_456",
      email: "jordan@example.com",
      displayName: "Jordan Lee",
      role: "supporter",
      createdAt,
    });
    const community = createCommunity({
      id: "community_123",
      ownerUserId: owner.id,
      slug: "neighbors-helping-neighbors",
      name: "Neighbors Helping Neighbors",
      description: "Volunteer coordination and updates.",
      visibility: "public",
      createdAt,
    });
    const post = createPost({
      id: "post_123",
      communityId: community.id,
      authorUserId: owner.id,
      title: "Kickoff update",
      body: "Meal prep starts Saturday.",
      status: "published",
      moderationStatus: "visible",
      createdAt,
    });
    const comment = createComment({
      id: "comment_123",
      postId: post.id,
      authorUserId: supporter.id,
      body: "I can help with setup.",
      status: "published",
      moderationStatus: "visible",
      createdAt,
    });
    const snapshot: PublicCommunitySnapshot = {
      community,
      owner,
      ownerProfile: createUserProfile({
        id: "profile_123",
        userId: owner.id,
        slug: "avery-johnson",
        bio: "Organizer building community support.",
        avatarUrl: "https://example.com/avery.png",
        profileType: "organizer",
        createdAt,
      }),
      featuredFundraiser: {
        fundraiser: createFundraiser({
          id: "fundraiser_123",
          ownerUserId: owner.id,
          slug: "warm-meals-2026",
          title: "Warm Meals 2026",
          story: "Funding hot meals.",
          status: "active",
          goalAmount: 250000,
          createdAt,
        }),
        owner,
        ownerProfile: createUserProfile({
          id: "profile_123",
          userId: owner.id,
          slug: "avery-johnson",
          bio: "Organizer building community support.",
          avatarUrl: "https://example.com/avery.png",
          profileType: "organizer",
          createdAt,
        }),
        relatedCommunity: community,
        donationCount: 4,
        supporterCount: 3,
        amountRaised: 12600,
      },
      fundraisers: [
        {
          fundraiser: createFundraiser({
            id: "fundraiser_123",
            ownerUserId: owner.id,
            slug: "warm-meals-2026",
            title: "Warm Meals 2026",
            story: "Funding hot meals.",
            status: "active",
            goalAmount: 250000,
            createdAt,
          }),
          owner,
          ownerProfile: createUserProfile({
            id: "profile_123",
            userId: owner.id,
            slug: "avery-johnson",
            bio: "Organizer building community support.",
            avatarUrl: "https://example.com/avery.png",
            profileType: "organizer",
            createdAt,
          }),
          relatedCommunity: community,
          donationCount: 4,
          supporterCount: 3,
          amountRaised: 12600,
        },
        {
          fundraiser: createFundraiser({
            id: "fundraiser_456",
            ownerUserId: owner.id,
            slug: "coat-drive",
            title: "Coat Drive",
            story: "Funding coats.",
            status: "active",
            goalAmount: 120000,
            createdAt: new Date("2026-03-16T11:00:00.000Z"),
          }),
          owner,
          ownerProfile: createUserProfile({
            id: "profile_123",
            userId: owner.id,
            slug: "avery-johnson",
            bio: "Organizer building community support.",
            avatarUrl: "https://example.com/avery.png",
            profileType: "organizer",
            createdAt,
          }),
          relatedCommunity: community,
          donationCount: 2,
          supporterCount: 2,
          amountRaised: 6100,
        },
      ],
      followerCount: 12,
      amountRaised: 18700,
      donationCount: 6,
      discussion: [
        {
          post,
          author: owner,
          comments: [
            {
              comment,
              author: supporter,
            },
          ],
        },
      ],
    };

    findCommunityBySlug.mockResolvedValue(snapshot);

    const result = await getPublicCommunityBySlug(
      { publicContentReadRepository: repository, analyticsEventPublisher },
      { slug: "neighbors-helping-neighbors" },
    );

    expect(result.status).toBe("success");
    if (result.status !== "success") {
      throw new Error("Expected success result.");
    }

    expect(result.data.community.followerCount).toBe(12);
    expect(result.data.community.fundraiserCount).toBe(2);
    expect(result.data.community.amountRaised).toBe(18700);
    expect(result.data.community.donationCount).toBe(6);
    expect(result.data.owner.profileSlug).toBe("avery-johnson");
    expect(result.data.owner.avatarUrl).toBe("https://example.com/avery.png");
    expect(result.data.leaderboard[0]).toEqual({
      rank: 1,
      fundraiser: {
        slug: "warm-meals-2026",
        title: "Warm Meals 2026",
        status: "active",
        goalAmount: 250000,
        amountRaised: 12600,
        supporterCount: 3,
        donationCount: 4,
      },
    });
    expect(result.data.discussion[0]).toMatchObject({
      id: "post_123",
      title: "Kickoff update",
      authorDisplayName: "Avery Johnson",
      comments: [
        {
          id: "comment_123",
          body: "I can help with setup.",
          authorDisplayName: "Jordan Lee",
        },
      ],
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "page_view.community",
        payload: {
          communitySlug: "neighbors-helping-neighbors",
        },
      }),
    );
  });
});

const createRepositoryStub = (
  overrides: Partial<PublicContentReadRepository> = {},
): PublicContentReadRepository => ({
  findProfileBySlug: vi.fn().mockResolvedValue(null),
  findFundraiserBySlug: vi.fn().mockResolvedValue(null),
  findCommunityBySlug: vi.fn().mockResolvedValue(null),
  listFundraisers: vi.fn().mockResolvedValue([]),
  listCommunities: vi.fn().mockResolvedValue([]),
  findProfileSlugByUserId: vi.fn().mockResolvedValue(null),
  ...overrides,
});

const createFundraiserSummarySnapshot = (
  snapshot: PublicFundraiserSummarySnapshot,
): PublicFundraiserSummarySnapshot => snapshot;

const createCommunitySummarySnapshot = (
  snapshot: PublicCommunitySummarySnapshot,
): PublicCommunitySummarySnapshot => snapshot;

const createAnalyticsEventPublisherStub = (): AnalyticsEventPublisher & {
  publish: ReturnType<typeof vi.fn>;
} => ({
  publish: vi.fn().mockResolvedValue(undefined),
});
