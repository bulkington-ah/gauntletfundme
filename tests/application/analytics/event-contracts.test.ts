import {
  analyticsEventNames,
  buildCommentCreatedEvent,
  buildCommunityCreatedEvent,
  buildCommunityPageViewedEvent,
  buildDonationCompletedEvent,
  buildFollowCompletedEvent,
  buildFundraiserCreatedEvent,
  buildFundraiserPageViewedEvent,
  buildPostCreatedEvent,
  buildProfilePageViewedEvent,
} from "@/application";

describe("analytics event contracts", () => {
  it("builds page view events with expected names and payload fields", () => {
    const profile = buildProfilePageViewedEvent({
      profileSlug: "avery-johnson",
    });
    const fundraiser = buildFundraiserPageViewedEvent({
      fundraiserSlug: "warm-meals-2026",
    });
    const community = buildCommunityPageViewedEvent({
      communitySlug: "neighbors-helping-neighbors",
    });

    expect(profile.name).toBe(analyticsEventNames.profilePageViewed);
    expect(profile.payload).toEqual({
      profileSlug: "avery-johnson",
    });
    expect(fundraiser.name).toBe(analyticsEventNames.fundraiserPageViewed);
    expect(fundraiser.payload).toEqual({
      fundraiserSlug: "warm-meals-2026",
    });
    expect(community.name).toBe(analyticsEventNames.communityPageViewed);
    expect(community.payload).toEqual({
      communitySlug: "neighbors-helping-neighbors",
    });
  });

  it("builds engagement and discussion events with consistent payload contracts", () => {
    const follow = buildFollowCompletedEvent({
      viewerUserId: "user_supporter_jordan",
      targetType: "community",
      targetSlug: "neighbors-helping-neighbors",
      created: true,
      followerCount: 3,
    });
    const post = buildPostCreatedEvent({
      viewerUserId: "user_organizer_avery",
      communitySlug: "neighbors-helping-neighbors",
      postId: "post_new_update",
    });
    const comment = buildCommentCreatedEvent({
      viewerUserId: "user_supporter_jordan",
      postId: "post_kickoff_update",
      commentId: "comment_new_shift_offer",
    });
    const createdCommunity = buildCommunityCreatedEvent({
      viewerUserId: "user_supporter_jordan",
      communityId: "community_jordan_garden_network",
      communitySlug: "jordan-garden-network",
    });
    const createdFundraiser = buildFundraiserCreatedEvent({
      viewerUserId: "user_supporter_jordan",
      fundraiserId: "fundraiser_spring_pantry_drive",
      fundraiserSlug: "spring-pantry-drive",
      communitySlug: "jordan-garden-network",
    });
    const donationIntent = buildDonationCompletedEvent({
      viewerUserId: "user_supporter_jordan",
      fundraiserSlug: "warm-meals-2026",
      donationId: "intent_new_123",
      amount: 2500,
    });

    expect(follow.name).toBe(analyticsEventNames.followCompleted);
    expect(follow.payload).toEqual({
      viewerUserId: "user_supporter_jordan",
      targetType: "community",
      targetSlug: "neighbors-helping-neighbors",
      created: true,
      followerCount: 3,
    });
    expect(post.name).toBe(analyticsEventNames.postCreated);
    expect(post.payload).toEqual({
      viewerUserId: "user_organizer_avery",
      communitySlug: "neighbors-helping-neighbors",
      postId: "post_new_update",
    });
    expect(comment.name).toBe(analyticsEventNames.commentCreated);
    expect(comment.payload).toEqual({
      viewerUserId: "user_supporter_jordan",
      postId: "post_kickoff_update",
      commentId: "comment_new_shift_offer",
    });
    expect(createdCommunity.name).toBe(analyticsEventNames.communityCreated);
    expect(createdCommunity.payload).toEqual({
      viewerUserId: "user_supporter_jordan",
      communityId: "community_jordan_garden_network",
      communitySlug: "jordan-garden-network",
    });
    expect(createdFundraiser.name).toBe(analyticsEventNames.fundraiserCreated);
    expect(createdFundraiser.payload).toEqual({
      viewerUserId: "user_supporter_jordan",
      fundraiserId: "fundraiser_spring_pantry_drive",
      fundraiserSlug: "spring-pantry-drive",
      communitySlug: "jordan-garden-network",
    });
    expect(donationIntent.name).toBe(analyticsEventNames.donationCompleted);
    expect(donationIntent.payload).toEqual({
      viewerUserId: "user_supporter_jordan",
      fundraiserSlug: "warm-meals-2026",
      donationId: "intent_new_123",
      amount: 2500,
    });
  });
});
