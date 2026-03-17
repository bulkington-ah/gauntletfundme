import {
  buildCommentCreatedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { authorizeProtectedAction } from "@/application/authorization";
import {
  createComment,
  DomainValidationError,
  requireNonEmptyString,
} from "@/domain";

import type {
  DiscussionSessionViewerGateway,
  DiscussionTargetLookup,
  DiscussionWriteRepository,
} from "./ports";

export type CreateCommentRequest = {
  sessionToken: string | null;
  postId: string;
  body: string;
};

export type CreateCommentResult =
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
      comment: {
        id: string;
        postId: string;
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

export const createCommentCommand = async (
  dependencies: Dependencies,
  request: CreateCommentRequest,
): Promise<CreateCommentResult> => {
  const validationError = validateCreateCommentRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );
  const authorization = authorizeProtectedAction({
    action: "create_comment",
    viewer,
  });

  if (authorization.status !== "authorized") {
    return {
      status: authorization.status,
      message:
        authorization.status === "unauthorized"
          ? `${authorization.message} Send the x-session-token header to continue.`
          : authorization.message,
    };
  }

  const normalizedPostId = requireNonEmptyString(request.postId, "postId");
  const post = await dependencies.discussionTargetLookup.findPostByIdForCommentCreation(
    normalizedPostId,
  );

  if (!post) {
    return {
      status: "not_found",
      message: `No published post was found for id "${normalizedPostId}".`,
    };
  }

  const persistedComment = await dependencies.discussionWriteRepository.createComment({
    postId: post.id,
    authorUserId: authorization.viewer.userId,
    body: requireNonEmptyString(request.body, "body"),
  });
  const comment = createComment(persistedComment);

  await dependencies.analyticsEventPublisher?.publish(
    buildCommentCreatedEvent({
      viewerUserId: authorization.viewer.userId,
      postId: comment.postId,
      commentId: comment.id,
    }),
  );

  return {
    status: "success",
    viewer: authorization.viewer,
    comment: {
      id: comment.id,
      postId: comment.postId,
      body: comment.body,
      status: "published",
      moderationStatus: "visible",
      createdAt: comment.createdAt.toISOString(),
    },
  };
};

const validateCreateCommentRequest = (
  request: CreateCommentRequest,
): CreateCommentResult | null => {
  try {
    requireNonEmptyString(request.postId, "postId");
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
