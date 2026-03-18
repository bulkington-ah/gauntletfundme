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

  it("uses explicit fundraiser linkage for related community context and community aggregates", async () => {
    const repository = createStaticPublicContentRepository();

    const fundraisers = await repository.listFundraisers();
    const community = await repository.findCommunityBySlug({
      slug: "neighbors-helping-neighbors",
    });

    expect(
      fundraisers.find((entry) => entry.fundraiser.slug === "community-fridge-expansion")
        ?.relatedCommunity?.slug,
    ).toBe("weekend-pantry-crew");
    expect(
      fundraisers.find((entry) => entry.fundraiser.slug === "school-supplies-spring")
        ?.relatedCommunity?.slug,
    ).toBe("school-success-network");
    expect(community?.fundraisers.map((entry) => entry.fundraiser.slug)).toEqual([
      "warm-meals-2026",
      "winter-coat-drive-2026",
    ]);
    expect(community?.amountRaised).toBe(30000);
    expect(community?.donationCount).toBe(7);
  });
});
