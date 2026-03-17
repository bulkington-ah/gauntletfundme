import {
  type AnalyticsEventPublisher,
  createPostCommand,
  type DiscussionSessionViewerGateway,
  type DiscussionTargetLookup,
  type DiscussionWriteRepository,
} from "@/application";

describe("createPostCommand", () => {
  it("rejects invalid requests before touching dependencies", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const discussionTargetLookup = createDiscussionTargetLookupStub();
    const discussionWriteRepository = createDiscussionWriteRepositoryStub();

    const result = await createPostCommand(
      {
        sessionViewerGateway,
        discussionTargetLookup,
        discussionWriteRepository,
      },
      {
        sessionToken: "demo-organizer-session",
        communitySlug: "%%% ",
        title: "",
        body: "Ready to organize.",
      },
    );

    expect(result).toEqual({
      status: "invalid_request",
      message: "communitySlug must include letters or numbers.",
    });
    expect(sessionViewerGateway.findViewerBySessionToken).not.toHaveBeenCalled();
    expect(
      discussionTargetLookup.findCommunityBySlugForPostCreation,
    ).not.toHaveBeenCalled();
    expect(discussionWriteRepository.createPost).not.toHaveBeenCalled();
  });

  it("returns unauthorized when no viewer can be resolved", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub();
    const discussionTargetLookup = createDiscussionTargetLookupStub();
    const discussionWriteRepository = createDiscussionWriteRepositoryStub();

    const result = await createPostCommand(
      {
        sessionViewerGateway,
        discussionTargetLookup,
        discussionWriteRepository,
      },
      {
        sessionToken: null,
        communitySlug: "neighbors-helping-neighbors",
        title: "Kitchen update",
        body: "Saturday prep is still on schedule.",
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message:
        "Authentication is required to create posts. Send the x-session-token header to continue.",
    });
    expect(
      discussionTargetLookup.findCommunityBySlugForPostCreation,
    ).not.toHaveBeenCalled();
    expect(discussionWriteRepository.createPost).not.toHaveBeenCalled();
  });

  it("returns forbidden when a non-owner supporter attempts to create a post", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_supporter_jordan",
        role: "supporter",
      },
    });
    const discussionTargetLookup = createDiscussionTargetLookupStub({
      community: {
        id: "community_neighbors_helping_neighbors",
        slug: "neighbors-helping-neighbors",
        ownerUserId: "user_organizer_avery",
      },
    });
    const discussionWriteRepository = createDiscussionWriteRepositoryStub();

    const result = await createPostCommand(
      {
        sessionViewerGateway,
        discussionTargetLookup,
        discussionWriteRepository,
      },
      {
        sessionToken: "demo-supporter-session",
        communitySlug: "neighbors-helping-neighbors",
        title: "Kitchen update",
        body: "Saturday prep is still on schedule.",
      },
    );

    expect(result).toEqual({
      status: "forbidden",
      message: "Only an authorized owner, moderator, or admin can create posts.",
    });
    expect(discussionWriteRepository.createPost).not.toHaveBeenCalled();
  });

  it("creates posts for authorized viewers", async () => {
    const sessionViewerGateway = createSessionViewerGatewayStub({
      viewer: {
        userId: "user_organizer_avery",
        role: "organizer",
      },
    });
    const discussionTargetLookup = createDiscussionTargetLookupStub({
      community: {
        id: "community_neighbors_helping_neighbors",
        slug: "neighbors-helping-neighbors",
        ownerUserId: "user_organizer_avery",
      },
    });
    const discussionWriteRepository = createDiscussionWriteRepositoryStub({
      post: {
        id: "post_new_update",
        communityId: "community_neighbors_helping_neighbors",
        authorUserId: "user_organizer_avery",
        title: "Kitchen update",
        body: "Saturday prep is still on schedule.",
        status: "published",
        moderationStatus: "visible",
        createdAt: new Date("2026-03-16T14:00:00.000Z"),
      },
    });
    const analyticsEventPublisher = createAnalyticsEventPublisherStub();

    const result = await createPostCommand(
      {
        sessionViewerGateway,
        discussionTargetLookup,
        discussionWriteRepository,
        analyticsEventPublisher,
      },
      {
        sessionToken: "demo-organizer-session",
        communitySlug: "neighbors-helping-neighbors",
        title: "Kitchen update",
        body: "Saturday prep is still on schedule.",
      },
    );

    expect(discussionWriteRepository.createPost).toHaveBeenCalledWith({
      communityId: "community_neighbors_helping_neighbors",
      authorUserId: "user_organizer_avery",
      title: "Kitchen update",
      body: "Saturday prep is still on schedule.",
    });
    expect(analyticsEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "discussion.post.created",
        payload: {
          viewerUserId: "user_organizer_avery",
          communitySlug: "neighbors-helping-neighbors",
          postId: "post_new_update",
        },
      }),
    );
    expect(result).toEqual({
      status: "success",
      viewer: {
        userId: "user_organizer_avery",
        role: "organizer",
      },
      community: {
        slug: "neighbors-helping-neighbors",
      },
      post: {
        id: "post_new_update",
        title: "Kitchen update",
        body: "Saturday prep is still on schedule.",
        status: "published",
        moderationStatus: "visible",
        createdAt: "2026-03-16T14:00:00.000Z",
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
  community = null,
}: {
  community?: Awaited<
    ReturnType<DiscussionTargetLookup["findCommunityBySlugForPostCreation"]>
  >;
} = {}): DiscussionTargetLookup & {
  findCommunityBySlugForPostCreation: ReturnType<typeof vi.fn>;
  findPostByIdForCommentCreation: ReturnType<typeof vi.fn>;
} => ({
  findCommunityBySlugForPostCreation: vi.fn().mockResolvedValue(community),
  findPostByIdForCommentCreation: vi.fn(),
});

const createDiscussionWriteRepositoryStub = ({
  post = {
    id: "post_default",
    communityId: "community_neighbors_helping_neighbors",
    authorUserId: "user_organizer_avery",
    title: "Default title",
    body: "Default body",
    status: "published" as const,
    moderationStatus: "visible" as const,
    createdAt: new Date("2026-03-16T14:00:00.000Z"),
  },
}: {
  post?: Awaited<ReturnType<DiscussionWriteRepository["createPost"]>>;
} = {}): DiscussionWriteRepository & {
  createPost: ReturnType<typeof vi.fn>;
  createComment: ReturnType<typeof vi.fn>;
} => ({
  createPost: vi.fn().mockResolvedValue(post),
  createComment: vi.fn(),
});

const createAnalyticsEventPublisherStub = (): AnalyticsEventPublisher & {
  publish: ReturnType<typeof vi.fn>;
} => ({
  publish: vi.fn().mockResolvedValue(undefined),
});
