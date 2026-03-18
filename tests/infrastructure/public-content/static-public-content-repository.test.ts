import { createStaticPublicContentRepository } from "@/infrastructure";

describe("StaticPublicContentRepository", () => {
  it("returns anonymous detail snapshots without viewer follow state", async () => {
    const repository = createStaticPublicContentRepository();

    const profile = await repository.findProfileBySlug({
      slug: "avery-johnson",
    });
    const fundraiser = await repository.findFundraiserBySlug({
      slug: "warm-meals-2026",
    });
    const community = await repository.findCommunityBySlug({
      slug: "neighbors-helping-neighbors",
    });

    expect(profile?.viewerFollowState).toBeNull();
    expect(fundraiser?.viewerFollowState).toBeNull();
    expect(community?.viewerFollowState).toBeNull();
  });

  it("derives viewer follow state for profiles, fundraisers, and communities", async () => {
    const repository = createStaticPublicContentRepository();

    const profile = await repository.findProfileBySlug({
      slug: "avery-johnson",
      viewerUserId: "user_supporter_jordan",
    });
    const fundraiser = await repository.findFundraiserBySlug({
      slug: "warm-meals-2026",
      viewerUserId: "user_supporter_jordan",
    });
    const community = await repository.findCommunityBySlug({
      slug: "neighbors-helping-neighbors",
      viewerUserId: "user_supporter_jordan",
    });
    const ownedProfile = await repository.findProfileBySlug({
      slug: "avery-johnson",
      viewerUserId: "user_organizer_avery",
    });

    expect(profile?.viewerFollowState).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
    expect(fundraiser?.viewerFollowState).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
    expect(community?.viewerFollowState).toEqual({
      isFollowing: true,
      isOwnTarget: false,
    });
    expect(ownedProfile?.viewerFollowState).toEqual({
      isFollowing: false,
      isOwnTarget: true,
    });
  });
});
