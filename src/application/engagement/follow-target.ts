import {
  DomainValidationError,
  followTargetTypes,
  normalizeSlug,
  type FollowTargetType,
} from "@/domain";

import type { AuthenticatedViewer, FollowTargetLookup, SessionViewerGateway } from "./ports";

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
      status: "not_implemented";
      message: string;
      viewer: AuthenticatedViewer;
      target: {
        type: FollowTargetType;
        slug: string;
      };
    };

type Dependencies = {
  sessionViewerGateway: SessionViewerGateway;
  followTargetLookup: FollowTargetLookup;
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
        "Authentication is required for follow commands. Send the x-demo-session header to exercise this placeholder write path.",
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

  return {
    status: "not_implemented",
    message:
      "The follow command boundary is wired through application and auth checks, but persistence is intentionally deferred to a later task.",
    viewer,
    target: {
      type: target.targetType,
      slug: target.slug,
    },
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
