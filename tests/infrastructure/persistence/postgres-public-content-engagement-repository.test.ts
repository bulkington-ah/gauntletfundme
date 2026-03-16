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
    expect(snapshot.followerCount).toBe(1);
    expect(snapshot.featuredFundraisers).toHaveLength(1);
    expect(snapshot.ownedCommunities).toHaveLength(1);
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
});

const createRepository = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  return createPostgresPublicContentEngagementRepository({
    sqlClient: pool,
  });
};
