import {
  buildPostCreatedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { authorizeProtectedAction } from "@/application/authorization";
import {
  createPost,
  DomainValidationError,
  normalizeSlug,
  requireNonEmptyString,
} from "@/domain";

import type {
  DiscussionSessionViewerGateway,
  DiscussionTargetLookup,
  DiscussionWriteRepository,
} from "./ports";

export type CreatePostRequest = {
  sessionToken: string | null;
  communitySlug: string;
  title: string;
  body: string;
};

export type CreatePostResult =
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "unauthorized";
      message: string;
    }
  | {
      status: "forbidden";
      message: string;
    }
  | {
      status: "not_found";
      message: string;
    }
  | {
      status: "success";
      viewer: {
        userId: string;
        role: "supporter" | "organizer" | "moderator" | "admin";
      };
      community: {
        slug: string;
      };
      post: {
        id: string;
        title: string;
        body: string;
        status: "published";
        moderationStatus: "visible";
        createdAt: string;
      };
    };

type Dependencies = {
  sessionViewerGateway: DiscussionSessionViewerGateway;
  discussionTargetLookup: DiscussionTargetLookup;
  discussionWriteRepository: DiscussionWriteRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const createPostCommand = async (
  dependencies: Dependencies,
  request: CreatePostRequest,
): Promise<CreatePostResult> => {
  const validationError = validateCreatePostRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );

  if (!viewer) {
    return {
      status: "unauthorized",
      message:
        "Authentication is required to create posts. Send the x-session-token header to continue.",
    };
  }

  const normalizedCommunitySlug = normalizeSlug(
    request.communitySlug,
    "communitySlug",
  );
  const community = await dependencies.discussionTargetLookup.findCommunityBySlugForPostCreation(
    normalizedCommunitySlug,
  );

  if (!community) {
    return {
      status: "not_found",
      message: `No community was found for slug "${normalizedCommunitySlug}".`,
    };
  }

  const ownershipAuthorization = authorizeProtectedAction({
    action: "create_post",
    viewer,
    ownerUserId: community.ownerUserId,
  });

  if (ownershipAuthorization.status !== "authorized") {
    return {
      status: ownershipAuthorization.status,
      message:
        ownershipAuthorization.status === "unauthorized"
          ? `${ownershipAuthorization.message} Send the x-session-token header to continue.`
          : ownershipAuthorization.message,
    };
  }

  const persistedPost = await dependencies.discussionWriteRepository.createPost({
    communityId: community.id,
    authorUserId: viewer.userId,
    title: requireNonEmptyString(request.title, "title"),
    body: requireNonEmptyString(request.body, "body"),
  });
  const post = createPost(persistedPost);

  await dependencies.analyticsEventPublisher?.publish(
    buildPostCreatedEvent({
      viewerUserId: viewer.userId,
      communitySlug: community.slug,
      postId: post.id,
    }),
  );

  return {
    status: "success",
    viewer,
    community: {
      slug: community.slug,
    },
    post: {
      id: post.id,
      title: post.title,
      body: post.body,
      status: "published",
      moderationStatus: "visible",
      createdAt: post.createdAt.toISOString(),
    },
  };
};

const validateCreatePostRequest = (
  request: CreatePostRequest,
): CreatePostResult | null => {
  try {
    normalizeSlug(request.communitySlug, "communitySlug");
    requireNonEmptyString(request.title, "title");
    requireNonEmptyString(request.body, "body");
  } catch (error) {
    if (error instanceof DomainValidationError) {
      return {
        status: "invalid_request",
        message: error.message,
      };
    }

    throw error;
  }

  return null;
};
