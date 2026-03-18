import {
  type Comment,
  type Community,
  type FollowTargetType,
  type Fundraiser,
  type Post,
  type ReportTargetType,
  type User,
  type UserProfile,
  DomainValidationError,
  createComment,
  createCommunity,
  createDonation,
  createFollow,
  createFundraiser,
  createPost,
  createReport,
  createUser,
  createUserProfile,
} from "@/domain";

const createdAt = new Date("2026-03-16T12:00:00.000Z");

describe("core domain models", () => {
  it("creates a user with normalized identity fields", () => {
    const user = createUser({
      id: "user_123",
      email: " Supporter@Example.com ",
      displayName: "  Casey Supporter  ",
      role: "supporter",
      createdAt,
    });

    expect(user).toEqual({
      id: "user_123",
      email: "supporter@example.com",
      displayName: "Casey Supporter",
      role: "supporter",
      createdAt,
    });
    expectTypeOf(user).toEqualTypeOf<User>();
  });

  it("normalizes profile and ownership slugs across public entities", () => {
    const profile = createUserProfile({
      id: "profile_123",
      userId: "user_123",
      slug: " Casey For Community ",
      bio: "  Building long-term support for the shelter.  ",
      avatarUrl: "  https://example.com/avatar.png  ",
      profileType: "organizer",
      createdAt,
    });
    const fundraiser = createFundraiser({
      id: "fundraiser_123",
      ownerUserId: "user_123",
      communityId: "community_123",
      slug: "Warm Meals 2026",
      title: "Warm Meals 2026",
      story: "Funding hot meals for families all winter.",
      status: "active",
      goalAmount: 250000,
      createdAt,
    });
    const community = createCommunity({
      id: "community_123",
      ownerUserId: "user_123",
      slug: " Neighbors Helping Neighbors ",
      name: "Neighbors Helping Neighbors",
      description: "Sharing updates and organizing volunteer shifts.",
      visibility: "public",
      createdAt,
    });

    expect(profile.slug).toBe("casey-for-community");
    expect(profile.avatarUrl).toBe("https://example.com/avatar.png");
    expect(fundraiser.communityId).toBe("community_123");
    expect(fundraiser.slug).toBe("warm-meals-2026");
    expect(community.slug).toBe("neighbors-helping-neighbors");
    expectTypeOf(profile).toEqualTypeOf<UserProfile>();
    expectTypeOf(fundraiser).toEqualTypeOf<Fundraiser>();
    expectTypeOf(community).toEqualTypeOf<Community>();
  });

  it("enforces positive integer amounts for fundraiser goals and donations", () => {
    expect(() =>
      createFundraiser({
        id: "fundraiser_123",
        ownerUserId: "user_123",
        slug: "warm-meals-2026",
        title: "Warm Meals 2026",
        story: "Funding hot meals for families all winter.",
        status: "draft",
        goalAmount: 0,
        createdAt,
      }),
    ).toThrowError(DomainValidationError);

    expect(() =>
      createDonation({
        id: "intent_123",
        userId: "user_123",
        fundraiserId: "fundraiser_123",
        amount: -500,
        status: "completed",
        createdAt,
      }),
    ).toThrowError("amount must be a positive integer.");
  });

  it("defaults fundraiser communityId to null when no community is linked", () => {
    const fundraiser = createFundraiser({
      id: "fundraiser_123",
      ownerUserId: "user_123",
      slug: "warm-meals-2026",
      title: "Warm Meals 2026",
      story: "Funding hot meals for families all winter.",
      status: "active",
      goalAmount: 250000,
      createdAt,
    });

    expect(fundraiser.communityId).toBeNull();
  });

  it("tracks content and moderation state for posts and comments", () => {
    const post = createPost({
      id: "post_123",
      communityId: "community_123",
      authorUserId: "user_123",
      title: "Volunteer kickoff",
      body: "We are meeting Saturday at 9 AM.",
      status: "published",
      moderationStatus: "visible",
      createdAt,
    });
    const comment = createComment({
      id: "comment_123",
      postId: "post_123",
      authorUserId: "user_456",
      body: "I can help with setup.",
      status: "published",
      moderationStatus: "flagged",
      createdAt,
    });

    expect(post.status).toBe("published");
    expect(post.moderationStatus).toBe("visible");
    expect(comment.status).toBe("published");
    expect(comment.moderationStatus).toBe("flagged");
    expectTypeOf(post).toEqualTypeOf<Post>();
    expectTypeOf(comment).toEqualTypeOf<Comment>();
  });

  it("supports polymorphic follow targets and moderation report targets", () => {
    const follow = createFollow({
      id: "follow_123",
      userId: "user_123",
      targetType: "community",
      targetId: "community_123",
      createdAt,
    });
    const report = createReport({
      id: "report_123",
      reporterUserId: "user_456",
      targetType: "comment",
      targetId: "comment_123",
      reason: "Spam links",
      status: "submitted",
      createdAt,
    });

    expect(follow.targetType).toBe("community");
    expect(report.targetType).toBe("comment");
    expectTypeOf(follow.targetType).toEqualTypeOf<FollowTargetType>();
    expectTypeOf(report.targetType).toEqualTypeOf<ReportTargetType>();
  });

  it("rejects blank discussion and moderation content", () => {
    expect(() =>
      createComment({
        id: "comment_123",
        postId: "post_123",
        authorUserId: "user_456",
        body: "   ",
        status: "published",
        moderationStatus: "visible",
        createdAt,
      }),
    ).toThrowError("body is required.");

    expect(() =>
      createReport({
        id: "report_123",
        reporterUserId: "user_456",
        targetType: "post",
        targetId: "post_123",
        reason: "   ",
        status: "submitted",
        createdAt,
      }),
    ).toThrowError("reason is required.");
  });
});
