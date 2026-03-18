// @vitest-environment node

import { newDb } from "pg-mem";

import {
  createPostgresPrototypeDataResetRepository,
  createPostgresPublicContentEngagementRepository,
} from "@/infrastructure";
import { loadCoreSchemaSql } from "@/infrastructure/persistence/schema";

describe("PostgresPublicContentEngagementRepository", () => {
  it("returns seeded public profile snapshots", async () => {
    const repository = await createSeededRepository();

    const snapshot = await repository.findProfileBySlug({
      slug: "avery-johnson",
    });

    expect(snapshot).not.toBeNull();
    if (!snapshot) {
      throw new Error("Expected a seeded profile snapshot.");
    }

    expect(snapshot.user.displayName).toBe("Avery Johnson");
    expect(snapshot.viewerFollowState).toBeNull();
    expect(snapshot.followerCount).toBe(5);
    expect(snapshot.followingCount).toBe(2);
    expect(snapshot.followers.map((entry) => entry.user.displayName)).toEqual([
      "Elena Gomez",
      "Priya Shah",
      "Sam Rivera",
      "Morgan Patel",
      "Jordan Lee",
    ]);
    expect(snapshot.following.map((entry) => entry.user.displayName)).toEqual([
      "Morgan Patel",
      "Jordan Lee",
    ]);
    expect(snapshot.inspiredSupporterCount).toBe(6);
    expect(snapshot.featuredFundraisers).toHaveLength(4);
    expect(snapshot.featuredFundraisers[0]?.fundraiser.slug).toBe("warm-meals-2026");
    expect(snapshot.featuredFundraisers[0]?.amountRaised).toBe(22000);
    expect(snapshot.ownedCommunities).toHaveLength(3);
    expect(snapshot.ownedCommunities[0]?.slug).toBe("school-success-network");
    expect(snapshot.recentActivity).not.toHaveLength(0);
  });

  it("lists seeded fundraiser browse summaries with related organizer context", async () => {
    const repository = await createSeededRepository();

    const fundraisers = await repository.listFundraisers();

    expect(fundraisers).toHaveLength(4);
    expect(fundraisers[0]?.fundraiser.slug).toBe("community-fridge-expansion");
    expect(fundraisers[0]?.owner.displayName).toBe("Avery Johnson");
    expect(fundraisers[0]?.ownerProfile?.slug).toBe("avery-johnson");
    expect(fundraisers[0]?.relatedCommunity?.slug).toBe("weekend-pantry-crew");
    expect(
      fundraisers.find((entry) => entry.fundraiser.slug === "school-supplies-spring")
        ?.relatedCommunity?.slug,
    ).toBe("school-success-network");
    expect(fundraisers.find((entry) => entry.fundraiser.slug === "warm-meals-2026"))
      .toMatchObject({
        amountRaised: 22000,
        supporterCount: 5,
        donationCount: 5,
      });
  });

  it("lists seeded communities with derived follower and fundraiser counts", async () => {
    const repository = await createSeededRepository();

    const communities = await repository.listCommunities();

    expect(communities).toHaveLength(3);
    expect(communities.map((entry) => entry.community.slug)).toEqual([
      "school-success-network",
      "weekend-pantry-crew",
      "neighbors-helping-neighbors",
    ]);
    expect(
      communities.find((entry) => entry.community.slug === "neighbors-helping-neighbors"),
    ).toMatchObject({
      followerCount: 4,
      fundraiserCount: 2,
    });
    expect(
      communities.find((entry) => entry.community.slug === "weekend-pantry-crew"),
    ).toMatchObject({
      followerCount: 3,
      fundraiserCount: 1,
    });
    expect(
      communities.find((entry) => entry.community.slug === "school-success-network"),
    ).toMatchObject({
      followerCount: 2,
      fundraiserCount: 1,
    });
  });

  it("finds a public profile slug by user id", async () => {
    const repository = await createSeededRepository();

    await expect(
      repository.findProfileSlugByUserId("user_organizer_avery"),
    ).resolves.toBe("avery-johnson");
    await expect(
      repository.findProfileSlugByUserId("user_missing"),
    ).resolves.toBeNull();
  });

  it("derives viewer follow state for public detail snapshots", async () => {
    const repository = await createSeededRepository();

    const profileSnapshot = await repository.findProfileBySlug({
      slug: "avery-johnson",
      viewerUserId: "user_supporter_jordan",
    });
    const fundraiserSnapshot = await repository.findFundraiserBySlug({
      slug: "warm-meals-2026",
      viewerUserId: "user_supporter_jordan",
    });
    const communitySnapshot = await repository.findCommunityBySlug({
      slug: "neighbors-helping-neighbors",
      viewerUserId: "user_supporter_jordan",
    });
    const ownedCommunitySnapshot = await repository.findCommunityBySlug({
      slug: "neighbors-helping-neighbors",
      viewerUserId: "user_organizer_avery",
    });

    expect(profileSnapshot?.viewerFollowState).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
    expect(fundraiserSnapshot?.viewerFollowState).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
    expect(communitySnapshot?.viewerFollowState).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
    expect(ownedCommunitySnapshot?.viewerFollowState).toEqual({
      isFollowing: false,
      isOwnTarget: true,
    });
  });

  it("creates follows idempotently", async () => {
    const repository = await createSeededRepository();

    const target = await repository.findTargetBySlug(
      "community",
      "neighbors-helping-neighbors",
    );

    expect(target).not.toBeNull();
    if (!target) {
      throw new Error("Expected target to be found.");
    }

    const first = await repository.createFollowIfAbsent({
      userId: "user_moderator_morgan",
      targetType: "community",
      targetId: target.id,
    });
    const second = await repository.createFollowIfAbsent({
      userId: "user_moderator_morgan",
      targetType: "community",
      targetId: target.id,
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.follow.id).toBe(first.follow.id);
    expect(
      await repository.countFollowersForTarget({
        targetType: "community",
        targetId: target.id,
      }),
    ).toBe(5);
  });

  it("removes follows idempotently and returns the latest follower count", async () => {
    const repository = await createSeededRepository();

    const target = await repository.findTargetBySlug(
      "community",
      "neighbors-helping-neighbors",
    );

    expect(target).not.toBeNull();
    if (!target) {
      throw new Error("Expected target to be found.");
    }

    const firstRemoval = await repository.removeFollowIfPresent({
      userId: "user_supporter_jordan",
      targetType: "community",
      targetId: target.id,
    });
    const secondRemoval = await repository.removeFollowIfPresent({
      userId: "user_supporter_jordan",
      targetType: "community",
      targetId: target.id,
    });

    expect(firstRemoval.removed).toBe(true);
    expect(secondRemoval.removed).toBe(false);
    expect(
      await repository.countFollowersForTarget({
        targetType: "community",
        targetId: target.id,
      }),
    ).toBe(3);
  });

  it("does not restore removed follows until prototype data is manually reset", async () => {
    const harness = createRepositoryHarness();
    await harness.resetRepository.resetPrototypeData();

    const profileTarget = await harness.repository.findTargetBySlug(
      "profile",
      "avery-johnson",
    );
    const fundraiserTarget = await harness.repository.findTargetBySlug(
      "fundraiser",
      "warm-meals-2026",
    );
    const communityTarget = await harness.repository.findTargetBySlug(
      "community",
      "neighbors-helping-neighbors",
    );

    expect(profileTarget).not.toBeNull();
    expect(fundraiserTarget).not.toBeNull();
    expect(communityTarget).not.toBeNull();

    await harness.repository.removeFollowIfPresent({
      userId: "user_supporter_jordan",
      targetType: "profile",
      targetId: profileTarget!.id,
    });
    await harness.repository.removeFollowIfPresent({
      userId: "user_supporter_jordan",
      targetType: "fundraiser",
      targetId: fundraiserTarget!.id,
    });
    await harness.repository.removeFollowIfPresent({
      userId: "user_supporter_jordan",
      targetType: "community",
      targetId: communityTarget!.id,
    });

    const freshRepository = createPostgresPublicContentEngagementRepository({
      sqlClient: harness.pool,
    });

    expect(
      (
        await freshRepository.findProfileBySlug({
          slug: "avery-johnson",
          viewerUserId: "user_supporter_jordan",
        })
      )?.viewerFollowState,
    ).toEqual({
      isFollowing: false,
      isOwnTarget: false,
    });
    expect(
      (
        await freshRepository.findFundraiserBySlug({
          slug: "warm-meals-2026",
          viewerUserId: "user_supporter_jordan",
        })
      )?.viewerFollowState,
    ).toEqual({
      isFollowing: false,
      isOwnTarget: false,
    });
    expect(
      (
        await freshRepository.findCommunityBySlug({
          slug: "neighbors-helping-neighbors",
          viewerUserId: "user_supporter_jordan",
        })
      )?.viewerFollowState,
    ).toEqual({
      isFollowing: false,
      isOwnTarget: false,
    });

    await harness.resetRepository.resetPrototypeData();

    expect(
      (
        await freshRepository.findProfileBySlug({
          slug: "avery-johnson",
          viewerUserId: "user_supporter_jordan",
        })
      )?.viewerFollowState,
    ).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
    expect(
      (
        await freshRepository.findFundraiserBySlug({
          slug: "warm-meals-2026",
          viewerUserId: "user_supporter_jordan",
        })
      )?.viewerFollowState,
    ).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
    expect(
      (
        await freshRepository.findCommunityBySlug({
          slug: "neighbors-helping-neighbors",
          viewerUserId: "user_supporter_jordan",
        })
      )?.viewerFollowState,
    ).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
  });

  it("resolves target owners for self-follow checks", async () => {
    const repository = await createSeededRepository();

    const profileTarget = await repository.findTargetBySlug("profile", "avery-johnson");
    const fundraiserTarget = await repository.findTargetBySlug(
      "fundraiser",
      "warm-meals-2026",
    );
    const communityTarget = await repository.findTargetBySlug(
      "community",
      "neighbors-helping-neighbors",
    );

    expect(profileTarget).not.toBeNull();
    expect(fundraiserTarget).not.toBeNull();
    expect(communityTarget).not.toBeNull();

    expect(
      await repository.findOwnerUserIdByTarget("profile", profileTarget!.id),
    ).toBe("user_organizer_avery");
    expect(
      await repository.findOwnerUserIdByTarget("fundraiser", fundraiserTarget!.id),
    ).toBe("user_organizer_avery");
    expect(
      await repository.findOwnerUserIdByTarget("community", communityTarget!.id),
    ).toBe("user_organizer_avery");
  });

  it("persists created communities and fundraisers for public reads", async () => {
    const repository = await createSeededRepository();

    const createdCommunity = await repository.createCommunity({
      ownerUserId: "user_supporter_jordan",
      slug: "jordan-garden-network",
      name: "Jordan Garden Network",
      description: "Shared planning for pantry beds and neighborhood harvests.",
      visibility: "public",
    });

    expect(
      await repository.findCommunityBySlugForCreation("jordan-garden-network"),
    ).toEqual({
      id: createdCommunity.id,
      slug: "jordan-garden-network",
    });
    expect(
      await repository.listOwnedCommunitiesByOwnerUserId("user_supporter_jordan"),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdCommunity.id,
          slug: "jordan-garden-network",
          ownerUserId: "user_supporter_jordan",
        }),
      ]),
    );
    expect(
      await repository.findOwnedCommunityBySlugForFundraiser(
        "user_supporter_jordan",
        "jordan-garden-network",
      ),
    ).toEqual({
      id: createdCommunity.id,
      slug: "jordan-garden-network",
      name: "Jordan Garden Network",
    });

    const createdFundraiser = await repository.createFundraiser({
      ownerUserId: "user_supporter_jordan",
      communityId: createdCommunity.id,
      slug: "spring-pantry-drive",
      title: "Spring Pantry Drive",
      story: "Funding pantry deliveries through spring.",
      status: "active",
      goalAmount: 18000,
    });

    expect(
      await repository.findFundraiserBySlugForCreation("spring-pantry-drive"),
    ).toEqual({
      id: createdFundraiser.id,
      slug: "spring-pantry-drive",
    });

    const communitySnapshot = await repository.findCommunityBySlug({
      slug: "jordan-garden-network",
    });
    const fundraiserSnapshot = await repository.findFundraiserBySlug({
      slug: "spring-pantry-drive",
    });

    expect(communitySnapshot).not.toBeNull();
    expect(communitySnapshot?.community.slug).toBe("jordan-garden-network");
    expect(communitySnapshot?.owner.displayName).toBe("Jordan Lee");
    expect(communitySnapshot?.fundraisers[0]?.fundraiser.slug).toBe(
      "spring-pantry-drive",
    );
    expect(fundraiserSnapshot).not.toBeNull();
    expect(fundraiserSnapshot?.summary.fundraiser.slug).toBe("spring-pantry-drive");
    expect(fundraiserSnapshot?.summary.relatedCommunity?.slug).toBe(
      "jordan-garden-network",
    );
    expect(fundraiserSnapshot?.summary.owner.displayName).toBe("Jordan Lee");
  });

  it("persists created posts and comments for public discussion reads", async () => {
    const repository = await createSeededRepository();

    const communityTarget = await repository.findCommunityBySlugForPostCreation(
      "neighbors-helping-neighbors",
    );

    expect(communityTarget).not.toBeNull();
    if (!communityTarget) {
      throw new Error("Expected community target to be found.");
    }

    const post = await repository.createPost({
      communityId: communityTarget.id,
      authorUserId: "user_organizer_avery",
      title: "Evening prep shift",
      body: "We added an evening prep shift for Wednesday.",
    });
    const comment = await repository.createComment({
      postId: post.id,
      authorUserId: "user_supporter_jordan",
      body: "I can help cover that shift.",
    });

    const communitySnapshot = await repository.findCommunityBySlug({
      slug: "neighbors-helping-neighbors",
    });

    expect(communitySnapshot).not.toBeNull();
    if (!communitySnapshot) {
      throw new Error("Expected community snapshot to be found.");
    }

    expect(communitySnapshot.discussion[0]?.post.id).toBe(post.id);
    expect(communitySnapshot.discussion[0]?.authorProfile?.slug).toBe(
      "avery-johnson",
    );
    expect(communitySnapshot.discussion[0]?.comments[0]?.comment.id).toBe(comment.id);
    expect(communitySnapshot.discussion[0]?.comments[0]?.authorProfile?.slug).toBe(
      "jordan-lee",
    );
    expect(
      await repository.findPostByIdForCommentCreation(post.id),
    ).toEqual({
      id: post.id,
    });
  });

  it("persists completed donations and increments fundraiser engagement counts", async () => {
    const repository = await createSeededRepository();

    const fundraiserTarget = await repository.findFundraiserBySlugForDonation(
      "warm-meals-2026",
    );

    expect(fundraiserTarget).not.toBeNull();
    if (!fundraiserTarget) {
      throw new Error("Expected fundraiser target to be found.");
    }

    const createdDonation = await repository.createDonation({
      userId: "user_moderator_morgan",
      fundraiserId: fundraiserTarget.id,
      amount: 4200,
    });

    expect(createdDonation.status).toBe("completed");
    expect(createdDonation.amount).toBe(4200);

    const fundraiserSnapshot = await repository.findFundraiserBySlug({
      slug: "warm-meals-2026",
    });

    expect(fundraiserSnapshot).not.toBeNull();
    if (!fundraiserSnapshot) {
      throw new Error("Expected fundraiser snapshot to be found.");
    }

    expect(fundraiserSnapshot.summary.donationCount).toBe(6);
    expect(fundraiserSnapshot.summary.amountRaised).toBe(26200);
    expect(fundraiserSnapshot.summary.supporterCount).toBe(5);
  });

  it("returns supporter digest activity scoped to followed, visible content only", async () => {
    const harness = createRepositoryHarness();
    await harness.resetRepository.resetPrototypeData();
    const { pool, repository } = harness;
    const windowStart = new Date("2026-03-16T13:21:00.000Z");
    const windowEnd = new Date("2026-03-16T14:30:00.000Z");

    await pool.query(`
      INSERT INTO posts
        (id, community_id, author_user_id, title, body, status, moderation_status, created_at)
      VALUES
        ('post_digest_visible', 'community_neighbors_helping_neighbors', 'user_organizer_avery', 'Evening prep update', 'Tonight''s prep plan is ready.', 'published', 'visible', '2026-03-16T14:00:00.000Z'),
        ('post_digest_removed', 'community_neighbors_helping_neighbors', 'user_organizer_avery', 'Removed update', 'This should stay hidden.', 'published', 'removed', '2026-03-16T14:05:00.000Z'),
        ('post_digest_unfollowed', 'community_school_success_network', 'user_organizer_avery', 'School organizer update', 'This should not appear for Jordan.', 'published', 'visible', '2026-03-16T14:10:00.000Z')
    `);
    await pool.query(`
      INSERT INTO comments
        (id, post_id, author_user_id, body, status, moderation_status, created_at)
      VALUES
        ('comment_digest_visible', 'post_volunteer_reminder', 'user_supporter_sam', 'I can cover a shift.', 'published', 'visible', '2026-03-16T14:02:00.000Z'),
        ('comment_digest_archived', 'post_volunteer_reminder', 'user_supporter_priya', 'Please ignore this one.', 'archived', 'visible', '2026-03-16T14:03:00.000Z'),
        ('comment_digest_removed', 'post_volunteer_reminder', 'user_supporter_noah', 'This comment was removed.', 'published', 'removed', '2026-03-16T14:04:00.000Z'),
        ('comment_digest_unfollowed', 'post_school_supply_dropoff', 'user_supporter_noah', 'School thread activity.', 'published', 'visible', '2026-03-16T14:05:00.000Z')
    `);
    await pool.query(`
      INSERT INTO donations
        (id, user_id, fundraiser_id, amount, status, created_at)
      VALUES
        ('donation_digest_warm_meals_one', 'user_supporter_elena', 'fundraiser_warm_meals_2026', 6000, 'completed', '2026-03-16T13:40:00.000Z'),
        ('donation_digest_warm_meals_two', 'user_moderator_morgan', 'fundraiser_warm_meals_2026', 2500, 'completed', '2026-03-16T13:45:00.000Z'),
        ('donation_digest_unfollowed', 'user_supporter_elena', 'fundraiser_school_supplies_spring', 9000, 'completed', '2026-03-16T13:50:00.000Z')
    `);

    const baseline = await repository.findSupporterDigestViewerBaseline(
      "user_supporter_jordan",
    );
    const fundraiserActivity =
      await repository.listSupporterDigestFundraiserActivity({
        userId: "user_supporter_jordan",
        windowStart,
        windowEnd,
      });
    const communityUpdates = await repository.listSupporterDigestCommunityUpdates({
      userId: "user_supporter_jordan",
      windowStart,
      windowEnd,
    });
    const discussionBursts = await repository.listSupporterDigestDiscussionBursts({
      userId: "user_supporter_jordan",
      windowStart,
      windowEnd,
    });

    expect(baseline).toEqual({
      viewerCreatedAt: new Date("2026-03-16T08:05:00.000Z"),
    });
    expect(fundraiserActivity).toEqual([
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
        lastDonationAt: new Date("2026-03-16T13:45:00.000Z"),
      },
    ]);
    expect(communityUpdates).toEqual([
      {
        communityId: "community_neighbors_helping_neighbors",
        communitySlug: "neighbors-helping-neighbors",
        communityName: "Neighbors Helping Neighbors",
        organizerDisplayName: "Avery Johnson",
        postId: "post_digest_visible",
        postTitle: "Evening prep update",
        publishedAt: new Date("2026-03-16T14:00:00.000Z"),
      },
    ]);
    expect(discussionBursts).toEqual([
      expect.objectContaining({
        communitySlug: "neighbors-helping-neighbors",
        communityName: "Neighbors Helping Neighbors",
        postId: "post_volunteer_reminder",
        postTitle: "Volunteer reminder",
        newCommentCount: 1,
        participantCount: 1,
        lastCommentAt: new Date("2026-03-16T14:02:00.000Z"),
      }),
    ]);
  });

  it("returns derived fundraiser and community engagement summaries for seeded content", async () => {
    const repository = await createSeededRepository();

    const fundraiserSnapshot = await repository.findFundraiserBySlug({
      slug: "warm-meals-2026",
    });
    const communitySnapshot = await repository.findCommunityBySlug({
      slug: "neighbors-helping-neighbors",
    });

    expect(fundraiserSnapshot).not.toBeNull();
    expect(communitySnapshot).not.toBeNull();

    expect(fundraiserSnapshot?.summary.amountRaised).toBe(22000);
    expect(fundraiserSnapshot?.summary.supporterCount).toBe(5);
    expect(fundraiserSnapshot?.recentDonations[0]?.actor.user.displayName).toBe(
      "Noah Kim",
    );
    expect(communitySnapshot?.followerCount).toBe(4);
    expect(communitySnapshot?.fundraisers).toHaveLength(2);
    expect(communitySnapshot?.featuredFundraiser?.fundraiser.slug).toBe(
      "warm-meals-2026",
    );
    expect(communitySnapshot?.amountRaised).toBe(30000);
    expect(communitySnapshot?.donationCount).toBe(7);
  });

  it("backfills legacy donation intent rows into completed donations during bootstrap", async () => {
    const { pool, repository } = createRepositoryHarness();

    await pool.query(loadCoreSchemaSql());
    await pool.query(`DROP TABLE donations CASCADE`);
    await pool.query(`DROP INDEX IF EXISTS donations_pkey`);
    await pool.query(`DROP INDEX IF EXISTS idx_donations_fundraiser_id`);
    await pool.query(`DROP INDEX IF EXISTS idx_donations_user_id_created_at`);
    await pool.query(`DROP TYPE donation_status`);
    await pool.query(`CREATE TYPE donation_intent_status AS ENUM ('started')`);
    await pool.query(`
      CREATE TABLE donation_intents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        fundraiser_id TEXT NOT NULL REFERENCES fundraisers(id) ON DELETE RESTRICT,
        amount BIGINT NOT NULL CHECK (amount > 0),
        status donation_intent_status NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(
      `INSERT INTO users (id, email, display_name, role, created_at)
       VALUES
         ('user_owner_legacy', 'legacy.owner@example.com', 'Legacy Owner', 'organizer', '2026-03-10T10:00:00.000Z'),
         ('user_supporter_legacy', 'legacy.supporter@example.com', 'Legacy Supporter', 'supporter', '2026-03-10T10:05:00.000Z')`,
    );
    await pool.query(
      `INSERT INTO fundraisers
         (id, owner_user_id, slug, title, story, status, goal_amount, created_at)
       VALUES
         ('fundraiser_legacy_drive', 'user_owner_legacy', 'legacy-drive', 'Legacy Drive', 'Legacy fundraiser story.', 'active', 5000, '2026-03-10T10:10:00.000Z')`,
    );
    await pool.query(
      `INSERT INTO donation_intents
         (id, user_id, fundraiser_id, amount, status, created_at)
       VALUES
         ('intent_legacy_drive_support', 'user_supporter_legacy', 'fundraiser_legacy_drive', 2400, 'started', '2026-03-10T10:15:00.000Z')`,
    );

    const fundraiserSnapshot = await repository.findFundraiserBySlug({
      slug: "legacy-drive",
    });

    expect(fundraiserSnapshot).not.toBeNull();
    expect(fundraiserSnapshot?.summary.amountRaised).toBe(2400);
    expect(fundraiserSnapshot?.summary.donationCount).toBe(1);
    expect(fundraiserSnapshot?.recentDonations[0]?.donation.status).toBe("completed");

    const persistedDonations = await pool.query<{
      id: string;
      amount: number;
      status: string;
    }>(
      `SELECT id, amount, status::text AS status
       FROM donations
       WHERE fundraiser_id = $1`,
      ["fundraiser_legacy_drive"],
    );

    expect(persistedDonations.rows).toEqual([
      {
        id: "intent_legacy_drive_support",
        amount: 2400,
        status: "completed",
      },
    ]);
  });

  it("resolves report targets and writes reports idempotently", async () => {
    const repository = await createSeededRepository();

    expect(
      await repository.findReportTargetById("post", "post_kickoff_update"),
    ).toEqual({
      id: "post_kickoff_update",
      targetType: "post",
    });

    const first = await repository.createReportIfAbsent({
      reporterUserId: "user_supporter_jordan",
      targetType: "post",
      targetId: "post_kickoff_update",
      reason: "Misinformation",
    });
    const second = await repository.createReportIfAbsent({
      reporterUserId: "user_supporter_jordan",
      targetType: "post",
      targetId: "post_kickoff_update",
      reason: "Misinformation",
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.report.id).toBe(first.report.id);
    expect(second.report.status).toBe("submitted");
  });

  it("applies moderation actions so removed content is excluded from public feeds", async () => {
    const repository = await createSeededRepository();

    const reportWrite = await repository.createReportIfAbsent({
      reporterUserId: "user_moderator_morgan",
      targetType: "post",
      targetId: "post_kickoff_update",
      reason: "Spam",
    });

    await repository.setModerationStatus({
      targetType: "post",
      targetId: "post_kickoff_update",
      moderationStatus: "removed",
    });
    await repository.setReportStatus({
      reportId: reportWrite.report.id,
      status: "actioned",
    });

    const report = await repository.findReportById(reportWrite.report.id);
    const community = await repository.findCommunityBySlug({
      slug: "neighbors-helping-neighbors",
    });

    expect(report).not.toBeNull();
    expect(report?.status).toBe("actioned");
    expect(community).not.toBeNull();
    expect(
      community?.discussion.some((entry) => entry.post.id === "post_kickoff_update"),
    ).toBe(false);
  });

  it("records supporter digest state without moving the cursor backward", async () => {
    const repository = await createSeededRepository();

    await repository.recordSupporterDigestView({
      userId: "user_supporter_jordan",
      viewedThrough: new Date("2026-03-18T12:00:00.000Z"),
    });
    await repository.recordSupporterDigestView({
      userId: "user_supporter_jordan",
      viewedThrough: new Date("2026-03-17T12:00:00.000Z"),
    });

    expect(
      await repository.findSupporterDigestStateByUserId("user_supporter_jordan"),
    ).toEqual({
      lastViewedAt: new Date("2026-03-18T12:00:00.000Z"),
    });
  });
});

const createSeededRepository = async () => {
  const harness = createRepositoryHarness();
  await harness.resetRepository.resetPrototypeData();
  return harness.repository;
};

const createRepositoryHarness = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  return {
    pool,
    resetRepository: createPostgresPrototypeDataResetRepository({
      sqlClient: pool,
    }),
    repository: createPostgresPublicContentEngagementRepository({
      sqlClient: pool,
    }),
  };
};
