import {
  type AnalyticsEventPublisher,
  createCommentCommand,
  type DiscussionSessionViewerGateway,
  type DiscussionTargetLookup,
  type DiscussionWriteRepository,
} from "@/application";

describe("createCommentCommand", () => {
  it("rejects invalid requests before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const discussionTargetLookup = createDiscussionTargetLookupStub();
    const discussionWriteRepository = createDiscussionWriteRepositoryStub();

    const result = await createCommentCommand(
      {
        sessionViewerGateway,
        discussionTargetLookup,
        discussionWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        postId: "",
        body: "I can cover the first shift.",
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "postId is required.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).not.toHaveBeenCalled();
    expect(discussionTargetLookup.findPostByIdForCommentCreation).not.toHaveBeenCalled();
    expect(discussionWriteRepository.createComment).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const discussionTargetLookup = createDiscussionTargetLookupStub();
    const discussionWriteRepository = createDiscussionWriteRepositoryStub();

    const result = await createCommentCommand(
      {
        sessionViewerGateway,
        discussionTargetLookup,
        discussionWriteRepository,
      },
      {
        sessionToken: null,
        postId: "post_kickoff_update",
        body: "I can cover the first shift.",
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message:
        "Authentication is required to create comments. Send the x-session-token header to continue.",
    });
    expect(discussionTargetLookup.findPostByIdForCommentCreation).not.toHaveBeenCalled();
    expect(discussionWriteRepository.createComment).not.toHaveBeenCalled();
  });

  it("returns not_found when the post is not available for comments", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const discussionTargetLookup = createDiscussionTargetLookupStub();
    const discussionWriteRepository = createDiscussionWriteRepositoryStub();

    const result = await createCommentCommand(
      {
        sessionViewerGateway,
        discussionTargetLookup,
        discussionWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        postId: "post_missing",
        body: "I can cover the first shift.",
      },
    );

    expect(result).toEqual({
      status: "not_found",
      message: 'No published post was found for id "post_missing".',
    });
    expect(discussionWriteRepository.createComment).not.toHaveBeenCalled();
  });

  it("creates comments for authenticated viewers", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const discussionTargetLookup = createDiscussionTargetLookupStub({
      post: {
        id: "post_kickoff_update",
      },
    });
    const discussionWriteRepository = createDiscussionWriteRepositoryStub({
      comment: {
        id: "comment_new_shift_offer",
        postId: "post_kickoff_update",
        authorUserId: "user_supporter_jordan",
        body: "I can cover the first shift.",
        status: "published",
        moderationStatus: "visible",
        createdAt: new Date("2026-03-16T14:20:00.000Z"),
      },
    });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();

    const result = await createCommentCommand(
      {
        sessionViewerGateway,
        discussionTargetLookup,
        discussionWriteRepository,
        analyticsEventPublisher,
      },
      {
        sessionToken: "demo-supporter-session",
        postId: "post_kickoff_update",
        body: "I can cover the first shift.",
      },
    );

    expect(discussionWriteRepository.createComment).toHaveBeenCalledWith({
      postId: "post_kickoff_update",
      authorUserId: "user_supporter_jordan",
      body: "I can cover the first shift.",
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "discussion.comment.created",
        payload: {
          viewerUserId: "user_supporter_jordan",
          postId: "post_kickoff_update",
          commentId: "comment_new_shift_offer",
        },
      }),
    );
    expect(result).toEqual({
      status: "success",
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
      comment: {
        id: "comment_new_shift_offer",
        postId: "post_kickoff_update",
        body: "I can cover the first shift.",
        status: "published",
        moderationStatus: "visible",
        createdAt: "2026-03-16T14:20:00.000Z",
      },
    });
  });
});

const createSessionViewerGatewayStub = ({
  viewer = null,
}: {
  viewer?: Awaited<
    ReturnType<DiscussionSessionViewerGateway["findViewerBySessionToken"]>
  >;
} = {}): DiscussionSessionViewerGateway & {
  findViewerBySessionToken: ReturnType<typeof vi.fn>;
} => ({
  findViewerBySessionToken: vi.fn().mockResolvedValue(viewer),
});

const createDiscussionTargetLookupStub = ({
  post = null,
}: {
  post?: Awaited<ReturnType<DiscussionTargetLookup["findPostByIdForCommentCreation"]>>;
} = {}): DiscussionTargetLookup & {
  findCommunityBySlugForPostCreation: ReturnType<typeof vi.fn>;
  findPostByIdForCommentCreation: ReturnType<typeof vi.fn>;
} => ({
  findCommunityBySlugForPostCreation: vi.fn(),
  findPostByIdForCommentCreation: vi.fn().mockResolvedValue(post),
});

const createDiscussionWriteRepositoryStub = ({
  comment = {
    id: "comment_default",
    postId: "post_kickoff_update",
    authorUserId: "user_supporter_jordan",
    body: "Default comment body",
    status: "published" as const,
    moderationStatus: "visible" as const,
    createdAt: new Date("2026-03-16T14:20:00.000Z"),
  },
}: {
  comment?: Awaited<ReturnType<DiscussionWriteRepository["createComment"]>>;
} = {}): DiscussionWriteRepository & {
  createPost: ReturnType<typeof vi.fn>;
  createComment: ReturnType<typeof vi.fn>;
} => ({
  createPost: vi.fn(),
  createComment: vi.fn().mockResolvedValue(comment),
});

const createAnalyticsEventPublisherStub = (): AnalyticsEventPublisher & {
  publish: ReturnType<typeof vi.fn>;
} => ({
  publish: vi.fn().mockResolvedValue(undefined),
});
