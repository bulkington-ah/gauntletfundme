import {
  DomainValidationError,
  followTargetTypes,
  normalizeSlug,
  type FollowTargetType,
} from "@/domain";

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
    };

type Dependencies = {
  sessionViewerGateway: SessionViewerGateway;
  followTargetLookup: FollowTargetLookup;
  followOwnerLookup: FollowOwnerLookup;
  followWriteRepository: FollowWriteRepository;
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

  if (!viewer) {
    return {
      status: "unauthorized",
      message:
        "Authentication is required for follow commands. Send the x-session-token header to continue.",
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

  if (targetOwnerUserId === viewer.userId) {
    return {
      status: "forbidden",
      message: "You cannot follow your own profile, fundraiser, or community.",
    };
  }

  const persistedFollow = await dependencies.followWriteRepository.createFollowIfAbsent(
    {
      userId: viewer.userId,
      targetType: target.targetType,
      targetId: target.id,
    },
  );

  return {
    status: "success",
    viewer,
    target: {
      type: target.targetType,
      slug: target.slug,
    },
    followId: persistedFollow.follow.id,
    created: persistedFollow.created,
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
