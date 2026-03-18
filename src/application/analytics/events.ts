export const analyticsEventNames = {
  profilePageViewed: "page_view.profile",
  fundraiserPageViewed: "page_view.fundraiser",
  communityPageViewed: "page_view.community",
  supporterDigestViewed: "page_view.supporter_digest",
  supporterDigestFallbackRendered: "supporter_digest.rendered_fallback",
  supporterDigestAcknowledged: "supporter_digest.acknowledged",
  followCompleted: "engagement.follow.completed",
  unfollowCompleted: "engagement.unfollow.completed",
  communityCreated: "community.created",
  fundraiserCreated: "fundraiser.created",
  postCreated: "discussion.post.created",
  commentCreated: "discussion.comment.created",
  donationCompleted: "engagement.donation.completed",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEventNames)[keyof typeof analyticsEventNames];

export type AnalyticsEventPayloadValue = string | number | boolean | null;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  payload: Record<string, AnalyticsEventPayloadValue>;
  occurredAt: string;
};

const toEvent = (
  name: AnalyticsEventName,
  payload: Record<string, AnalyticsEventPayloadValue>,
  occurredAt: Date = new Date(),
): AnalyticsEvent => ({
  name,
  payload,
  occurredAt: occurredAt.toISOString(),
});

export const buildProfilePageViewedEvent = (input: {
  profileSlug: string;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.profilePageViewed, {
    profileSlug: input.profileSlug,
  });

export const buildFundraiserPageViewedEvent = (input: {
  fundraiserSlug: string;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.fundraiserPageViewed, {
    fundraiserSlug: input.fundraiserSlug,
  });

export const buildCommunityPageViewedEvent = (input: {
  communitySlug: string;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.communityPageViewed, {
    communitySlug: input.communitySlug,
  });

export const buildSupporterDigestViewedEvent = (input: {
  viewerUserId: string;
  generationMode: "openai" | "deterministic";
  highlightCount: number;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.supporterDigestViewed, {
    viewerUserId: input.viewerUserId,
    generationMode: input.generationMode,
    highlightCount: input.highlightCount,
  });

export const buildSupporterDigestFallbackRenderedEvent = (input: {
  viewerUserId: string;
  highlightCount: number;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.supporterDigestFallbackRendered, {
    viewerUserId: input.viewerUserId,
    highlightCount: input.highlightCount,
  });

export const buildSupporterDigestAcknowledgedEvent = (input: {
  viewerUserId: string;
  viewedThrough: string;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.supporterDigestAcknowledged, {
    viewerUserId: input.viewerUserId,
    viewedThrough: input.viewedThrough,
  });

export const buildFollowCompletedEvent = (input: {
  viewerUserId: string;
  targetType: "profile" | "fundraiser" | "community";
  targetSlug: string;
  created: boolean;
  followerCount: number;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.followCompleted, {
    viewerUserId: input.viewerUserId,
    targetType: input.targetType,
    targetSlug: input.targetSlug,
    created: input.created,
    followerCount: input.followerCount,
  });

export const buildUnfollowCompletedEvent = (input: {
  viewerUserId: string;
  targetType: "profile" | "fundraiser" | "community";
  targetSlug: string;
  removed: boolean;
  followerCount: number;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.unfollowCompleted, {
    viewerUserId: input.viewerUserId,
    targetType: input.targetType,
    targetSlug: input.targetSlug,
    removed: input.removed,
    followerCount: input.followerCount,
  });

export const buildCommentCreatedEvent = (input: {
  viewerUserId: string;
  postId: string;
  commentId: string;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.commentCreated, {
    viewerUserId: input.viewerUserId,
    postId: input.postId,
    commentId: input.commentId,
  });

export const buildCommunityCreatedEvent = (input: {
  viewerUserId: string;
  communityId: string;
  communitySlug: string;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.communityCreated, {
    viewerUserId: input.viewerUserId,
    communityId: input.communityId,
    communitySlug: input.communitySlug,
  });

export const buildFundraiserCreatedEvent = (input: {
  viewerUserId: string;
  fundraiserId: string;
  fundraiserSlug: string;
  communitySlug: string | null;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.fundraiserCreated, {
    viewerUserId: input.viewerUserId,
    fundraiserId: input.fundraiserId,
    fundraiserSlug: input.fundraiserSlug,
    communitySlug: input.communitySlug,
  });

export const buildPostCreatedEvent = (input: {
  viewerUserId: string;
  communitySlug: string;
  postId: string;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.postCreated, {
    viewerUserId: input.viewerUserId,
    communitySlug: input.communitySlug,
    postId: input.postId,
  });

export const buildDonationCompletedEvent = (input: {
  viewerUserId: string;
  fundraiserSlug: string;
  donationId: string;
  amount: number;
}): AnalyticsEvent =>
  toEvent(analyticsEventNames.donationCompleted, {
    viewerUserId: input.viewerUserId,
    fundraiserSlug: input.fundraiserSlug,
    donationId: input.donationId,
    amount: input.amount,
  });
