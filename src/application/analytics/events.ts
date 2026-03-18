export const analyticsEventNames = {
  profilePageViewed: "page_view.profile",
  fundraiserPageViewed: "page_view.fundraiser",
  communityPageViewed: "page_view.community",
  followCompleted: "engagement.follow.completed",
  postCreated: "discussion.post.created",
  commentCreated: "discussion.comment.created",
  donationCompleted: "engagement.donation.completed",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEventNames)[keyof typeof analyticsEventNames];

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  payload: Record<string, string | number | boolean | null>;
  occurredAt: string;
};

const toEvent = (
  name: AnalyticsEventName,
  payload: Record<string, string | number | boolean | null>,
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
