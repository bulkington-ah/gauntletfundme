import {
  buildCommunityCreatedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { authorizeProtectedAction } from "@/application/authorization";
import {
  createCommunity,
  DomainValidationError,
  normalizeSlug,
  requireNonEmptyString,
} from "@/domain";

import type {
  CommunitySessionViewerGateway,
  CommunityWriteRepository,
} from "./ports";

export type CreateCommunityRequest = {
  sessionToken: string | null;
  name: string;
  description: string;
};

export type CreateCommunityResult =
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
      status: "conflict";
      message: string;
    }
  | {
      status: "success";
      viewer: {
        userId: string;
        role: "supporter" | "organizer" | "moderator" | "admin";
      };
      community: {
        id: string;
        slug: string;
        name: string;
        description: string;
        visibility: "public";
        createdAt: string;
      };
    };

type Dependencies = {
  sessionViewerGateway: CommunitySessionViewerGateway;
  communityWriteRepository: CommunityWriteRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const createCommunityCommand = async (
  dependencies: Dependencies,
  request: CreateCommunityRequest,
): Promise<CreateCommunityResult> => {
  const validationError = validateCreateCommunityRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );
  const authorization = authorizeProtectedAction({
    action: "create_community",
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

  const normalizedName = requireNonEmptyString(request.name, "name");
  const normalizedDescription = requireNonEmptyString(
    request.description,
    "description",
  );
  const slug = normalizeSlug(normalizedName, "name");
  const existingCommunity =
    await dependencies.communityWriteRepository.findCommunityBySlugForCreation(slug);

  if (existingCommunity) {
    return {
      status: "conflict",
      message: `A community already exists for slug "${slug}".`,
    };
  }

  const persistedCommunity = await dependencies.communityWriteRepository.createCommunity({
    ownerUserId: authorization.viewer.userId,
    slug,
    name: normalizedName,
    description: normalizedDescription,
    visibility: "public",
  });
  const community = createCommunity(persistedCommunity);

  await dependencies.analyticsEventPublisher?.publish(
    buildCommunityCreatedEvent({
      viewerUserId: authorization.viewer.userId,
      communityId: community.id,
      communitySlug: community.slug,
    }),
  );

  return {
    status: "success",
    viewer: authorization.viewer,
    community: {
      id: community.id,
      slug: community.slug,
      name: community.name,
      description: community.description,
      visibility: "public",
      createdAt: community.createdAt.toISOString(),
    },
  };
};

const validateCreateCommunityRequest = (
  request: CreateCommunityRequest,
): CreateCommunityResult | null => {
  try {
    requireNonEmptyString(request.name, "name");
    requireNonEmptyString(request.description, "description");
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
