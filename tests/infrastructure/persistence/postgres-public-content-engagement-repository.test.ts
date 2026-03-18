// @vitest-environment node

import { newDb } from "pg-mem";

import { createPostgresPublicContentEngagementRepository } from "@/infrastructure";

describe("PostgresPublicContentEngagementRepository", () => {
  it("returns seeded public profile snapshots", async () => {
    const repository = createRepository();

    const snapshot = await repository.findProfileBySlug("avery-johnson");

    expect(snapshot).not.toBeNull();
    if (!snapshot) {
      throw new Error("Expected a seeded profile snapshot.");
    }

    expect(snapshot.user.displayName).toBe("Avery Johnson");
    expect(snapshot.followerCount).toBe(5);
    expect(snapshot.followingCount).toBe(2);
    expect(snapshot.inspiredSupporterCount).toBe(6);
    expect(snapshot.featuredFundraisers).toHaveLength(4);
    expect(snapshot.featuredFundraisers[0]?.fundraiser.slug).toBe("warm-meals-2026");
    expect(snapshot.featuredFundraisers[0]?.supportAmount).toBe(22000);
    expect(snapshot.ownedCommunities).toHaveLength(3);
    expect(snapshot.ownedCommunities[0]?.slug).toBe("school-success-network");
    expect(snapshot.recentActivity).not.toHaveLength(0);
  });

  it("lists seeded fundraiser browse summaries with related organizer context", async () => {
    const repository = createRepository();

    const fundraisers = await repository.listFundraisers();

    expect(fundraisers).toHaveLength(4);
    expect(fundraisers[0]?.fundraiser.slug).toBe("community-fridge-expansion");
    expect(fundraisers[0]?.owner.displayName).toBe("Avery Johnson");
    expect(fundraisers[0]?.ownerProfile?.slug).toBe("avery-johnson");
    expect(fundraisers[0]?.relatedCommunity?.slug).toBe("school-success-network");
    expect(fundraisers.find((entry) => entry.fundraiser.slug === "warm-meals-2026"))
      .toMatchObject({
        supportAmount: 22000,
        supporterCount: 5,
        donationIntentCount: 5,
      });
  });

  it("lists seeded communities with derived follower and fundraiser counts", async () => {
    const repository = createRepository();

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
      fundraiserCount: 4,
    });
    expect(
      communities.find((entry) => entry.community.slug === "weekend-pantry-crew"),
    ).toMatchObject({
      followerCount: 3,
      fundraiserCount: 4,
    });
  });

  it("finds a public profile slug by user id", async () => {
    const repository = createRepository();

    await expect(
      repository.findProfileSlugByUserId("user_organizer_avery"),
    ).resolves.toBe("avery-johnson");
    await expect(
      repository.findProfileSlugByUserId("user_missing"),
    ).resolves.toBeNull();
  });

  it("creates follows idempotently", async () => {
    const repository = createRepository();

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
    const repository = createRepository();

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

  it("resolves target owners for self-follow checks", async () => {
    const repository = createRepository();

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

  it("persists created posts and comments for public discussion reads", async () => {
    const repository = createRepository();

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

    const communitySnapshot = await repository.findCommunityBySlug(
      "neighbors-helping-neighbors",
    );

    expect(communitySnapshot).not.toBeNull();
    if (!communitySnapshot) {
      throw new Error("Expected community snapshot to be found.");
    }

    expect(communitySnapshot.discussion[0]?.post.id).toBe(post.id);
    expect(communitySnapshot.discussion[0]?.comments[0]?.comment.id).toBe(comment.id);
    expect(
      await repository.findPostByIdForCommentCreation(post.id),
    ).toEqual({
      id: post.id,
    });
  });

  it("persists donation intents and increments fundraiser engagement counts", async () => {
    const repository = createRepository();

    const fundraiserTarget =
      await repository.findFundraiserBySlugForDonationIntent("warm-meals-2026");

    expect(fundraiserTarget).not.toBeNull();
    if (!fundraiserTarget) {
      throw new Error("Expected fundraiser target to be found.");
    }

    const createdIntent = await repository.createDonationIntent({
      userId: "user_moderator_morgan",
      fundraiserId: fundraiserTarget.id,
      amount: 4200,
    });

    expect(createdIntent.status).toBe("started");
    expect(createdIntent.amount).toBe(4200);

    const fundraiserSnapshot = await repository.findFundraiserBySlug(
      "warm-meals-2026",
    );

    expect(fundraiserSnapshot).not.toBeNull();
    if (!fundraiserSnapshot) {
      throw new Error("Expected fundraiser snapshot to be found.");
    }

    expect(fundraiserSnapshot.summary.donationIntentCount).toBe(6);
    expect(fundraiserSnapshot.summary.supportAmount).toBe(26200);
    expect(fundraiserSnapshot.summary.supporterCount).toBe(5);
  });

  it("returns derived fundraiser and community engagement summaries for seeded content", async () => {
    const repository = createRepository();

    const fundraiserSnapshot = await repository.findFundraiserBySlug(
      "warm-meals-2026",
    );
    const communitySnapshot = await repository.findCommunityBySlug(
      "neighbors-helping-neighbors",
    );

    expect(fundraiserSnapshot).not.toBeNull();
    expect(communitySnapshot).not.toBeNull();

    expect(fundraiserSnapshot?.summary.supportAmount).toBe(22000);
    expect(fundraiserSnapshot?.summary.supporterCount).toBe(5);
    expect(fundraiserSnapshot?.recentSupporters[0]?.actor.user.displayName).toBe(
      "Noah Kim",
    );
    expect(communitySnapshot?.followerCount).toBe(4);
    expect(communitySnapshot?.fundraisers).toHaveLength(4);
    expect(communitySnapshot?.featuredFundraiser?.fundraiser.slug).toBe(
      "warm-meals-2026",
    );
    expect(communitySnapshot?.supportAmount).toBe(50500);
    expect(communitySnapshot?.donationIntentCount).toBe(11);
  });

  it("resolves report targets and writes reports idempotently", async () => {
    const repository = createRepository();

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
    const repository = createRepository();

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
    const community = await repository.findCommunityBySlug(
      "neighbors-helping-neighbors",
    );

    expect(report).not.toBeNull();
    expect(report?.status).toBe("actioned");
    expect(community).not.toBeNull();
    expect(
      community?.discussion.some((entry) => entry.post.id === "post_kickoff_update"),
    ).toBe(false);
  });
});

const createRepository = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  return createPostgresPublicContentEngagementRepository({
    sqlClient: pool,
  });
};
