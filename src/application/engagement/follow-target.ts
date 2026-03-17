import {
  DomainValidationError,
  followTargetTypes,
  normalizeSlug,
  type FollowTargetType,
} from "@/domain";
import { buildFollowCompletedEvent } from "@/application/analytics";
import { authorizeProtectedAction } from "@/application/authorization";
import type { AnalyticsEventPublisher } from "@/application/analytics";

import type {
  AuthenticatedViewer,
  FollowOwnerLookup,
  FollowTargetLookup,
  FollowWriteRepository,
  SessionViewerGateway,
} from "./ports";

export type FollowTargetRequest = {
  sessionToken: string | null;
  targetType: string;
  targetSlug: string;
};

export type FollowTargetResult =
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "unauthorized";
      message: string;
    }
  | {
      status: "not_found";
      message: string;
    }
  | {
      status: "forbidden";
      message: string;
    }
  | {
      status: "success";
      viewer: AuthenticatedViewer;
      target: {
        type: FollowTargetType;
        slug: string;
      };
      followId: string;
      created: boolean;
      followerCount: number;
      following: true;
    };

type Dependencies = {
  sessionViewerGateway: SessionViewerGateway;
  followTargetLookup: FollowTargetLookup;
  followOwnerLookup: FollowOwnerLookup;
  followWriteRepository: FollowWriteRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const followTarget = async (
  dependencies: Dependencies,
  request: FollowTargetRequest,
): Promise<FollowTargetResult> => {
  const validationError = validateFollowTargetRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );

  const authorization = authorizeProtectedAction({
    action: "follow_target",
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

  const normalizedSlug = normalizeSlug(request.targetSlug, "targetSlug");
  const targetType = request.targetType as FollowTargetType;
  const target = await dependencies.followTargetLookup.findTargetBySlug(
    targetType,
    normalizedSlug,
  );

  if (!target) {
    return {
      status: "not_found",
      message: `No ${targetType} was found for slug "${normalizedSlug}".`,
    };
  }

  const targetOwnerUserId = await dependencies.followOwnerLookup.findOwnerUserIdByTarget(
    target.targetType,
    target.id,
  );

  const ownershipAuthorization = authorizeProtectedAction({
    action: "follow_target",
    viewer: authorization.viewer,
    ownerUserId: targetOwnerUserId,
  });

  if (ownershipAuthorization.status !== "authorized") {
    return {
      status: ownershipAuthorization.status,
      message: ownershipAuthorization.message,
    };
  }

  const persistedFollow = await dependencies.followWriteRepository.createFollowIfAbsent(
    {
      userId: authorization.viewer.userId,
      targetType: target.targetType,
      targetId: target.id,
    },
  );
  const followerCount = await dependencies.followWriteRepository.countFollowersForTarget(
    {
      targetType: target.targetType,
      targetId: target.id,
    },
  );

  await dependencies.analyticsEventPublisher?.publish(
    buildFollowCompletedEvent({
      viewerUserId: authorization.viewer.userId,
      targetType: target.targetType,
      targetSlug: target.slug,
      created: persistedFollow.created,
      followerCount,
    }),
  );

  return {
    status: "success",
    viewer: authorization.viewer,
    target: {
      type: target.targetType,
      slug: target.slug,
    },
    followId: persistedFollow.follow.id,
    created: persistedFollow.created,
    followerCount,
    following: true,
  };
};

const validateFollowTargetRequest = (
  request: FollowTargetRequest,
): FollowTargetResult | null => {
  if (!followTargetTypes.includes(request.targetType as FollowTargetType)) {
    return {
      status: "invalid_request",
      message: `targetType must be one of: ${followTargetTypes.join(", ")}.`,
    };
  }

  try {
    normalizeSlug(request.targetSlug, "targetSlug");
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
