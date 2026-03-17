import {
  DomainValidationError,
  followTargetTypes,
  normalizeSlug,
  type FollowTargetType,
} from "@/domain";
import { authorizeProtectedAction } from "@/application/authorization";

import type {
  AuthenticatedViewer,
  FollowTargetLookup,
  FollowWriteRepository,
  SessionViewerGateway,
} from "./ports";

export type UnfollowTargetRequest = {
  sessionToken: string | null;
  targetType: string;
  targetSlug: string;
};

export type UnfollowTargetResult =
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
      viewer: AuthenticatedViewer;
      target: {
        type: FollowTargetType;
        slug: string;
      };
      removed: boolean;
      followerCount: number;
      following: false;
    };

type Dependencies = {
  sessionViewerGateway: SessionViewerGateway;
  followTargetLookup: FollowTargetLookup;
  followWriteRepository: FollowWriteRepository;
};

export const unfollowTarget = async (
  dependencies: Dependencies,
  request: UnfollowTargetRequest,
): Promise<UnfollowTargetResult> => {
  const validationError = validateUnfollowTargetRequest(request);

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

  const removal = await dependencies.followWriteRepository.removeFollowIfPresent({
    userId: authorization.viewer.userId,
    targetType: target.targetType,
    targetId: target.id,
  });
  const followerCount = await dependencies.followWriteRepository.countFollowersForTarget(
    {
      targetType: target.targetType,
      targetId: target.id,
    },
  );

  return {
    status: "success",
    viewer: authorization.viewer,
    target: {
      type: target.targetType,
      slug: target.slug,
    },
    removed: removal.removed,
    followerCount,
    following: false,
  };
};

const validateUnfollowTargetRequest = (
  request: UnfollowTargetRequest,
): UnfollowTargetResult | null => {
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
