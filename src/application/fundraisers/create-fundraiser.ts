import {
  buildFundraiserCreatedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { authorizeProtectedAction } from "@/application/authorization";
import {
  createFundraiser,
  DomainValidationError,
  normalizeSlug,
  requireNonEmptyString,
  requirePositiveInteger,
} from "@/domain";

import type {
  FundraiserCommunityOwnershipLookup,
  FundraiserSessionViewerGateway,
  FundraiserWriteRepository,
} from "./ports";

export type CreateFundraiserRequest = {
  sessionToken: string | null;
  title: string;
  story: string;
  goalAmount: number;
  communitySlug?: string | null;
};

export type CreateFundraiserResult =
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
      fundraiser: {
        id: string;
        slug: string;
        title: string;
        story: string;
        status: "active";
        goalAmount: number;
        createdAt: string;
      };
      community: {
        slug: string;
        name: string;
      } | null;
    };

type Dependencies = {
  sessionViewerGateway: FundraiserSessionViewerGateway;
  fundraiserWriteRepository: FundraiserWriteRepository;
  fundraiserCommunityOwnershipLookup: FundraiserCommunityOwnershipLookup;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const createFundraiserCommand = async (
  dependencies: Dependencies,
  request: CreateFundraiserRequest,
): Promise<CreateFundraiserResult> => {
  const validationError = validateCreateFundraiserRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );
  const authorization = authorizeProtectedAction({
    action: "create_fundraiser",
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

  const normalizedTitle = requireNonEmptyString(request.title, "title");
  const normalizedStory = requireNonEmptyString(request.story, "story");
  const goalAmount = requirePositiveInteger(request.goalAmount, "goalAmount");
  const slug = normalizeSlug(normalizedTitle, "title");
  const existingFundraiser =
    await dependencies.fundraiserWriteRepository.findFundraiserBySlugForCreation(
      slug,
    );

  if (existingFundraiser) {
    return {
      status: "conflict",
      message: `A fundraiser already exists for slug "${slug}".`,
    };
  }

  const normalizedCommunitySlug = normalizeOptionalCommunitySlug(request.communitySlug);
  const ownedCommunity = normalizedCommunitySlug
    ? await dependencies.fundraiserCommunityOwnershipLookup.findOwnedCommunityBySlugForFundraiser(
        authorization.viewer.userId,
        normalizedCommunitySlug,
      )
    : null;

  if (normalizedCommunitySlug && !ownedCommunity) {
    return {
      status: "forbidden",
      message: "You can only link a fundraiser to a community you own.",
    };
  }

  const persistedFundraiser =
    await dependencies.fundraiserWriteRepository.createFundraiser({
      ownerUserId: authorization.viewer.userId,
      communityId: ownedCommunity?.id ?? null,
      slug,
      title: normalizedTitle,
      story: normalizedStory,
      status: "active",
      goalAmount,
    });
  const fundraiser = createFundraiser(persistedFundraiser);

  await dependencies.analyticsEventPublisher?.publish(
    buildFundraiserCreatedEvent({
      viewerUserId: authorization.viewer.userId,
      fundraiserId: fundraiser.id,
      fundraiserSlug: fundraiser.slug,
      communitySlug: ownedCommunity?.slug ?? null,
    }),
  );

  return {
    status: "success",
    viewer: authorization.viewer,
    fundraiser: {
      id: fundraiser.id,
      slug: fundraiser.slug,
      title: fundraiser.title,
      story: fundraiser.story,
      status: "active",
      goalAmount: fundraiser.goalAmount,
      createdAt: fundraiser.createdAt.toISOString(),
    },
    community: ownedCommunity
      ? {
          slug: ownedCommunity.slug,
          name: ownedCommunity.name,
        }
      : null,
  };
};

const validateCreateFundraiserRequest = (
  request: CreateFundraiserRequest,
): CreateFundraiserResult | null => {
  try {
    requireNonEmptyString(request.title, "title");
    requireNonEmptyString(request.story, "story");
    requirePositiveInteger(request.goalAmount, "goalAmount");

    const normalizedCommunitySlug = normalizeOptionalCommunitySlug(request.communitySlug);
    if (normalizedCommunitySlug) {
      normalizeSlug(normalizedCommunitySlug, "communitySlug");
    }
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

const normalizeOptionalCommunitySlug = (
  communitySlug: string | null | undefined,
): string | null => {
  const normalizedValue = communitySlug?.trim() ?? "";

  return normalizedValue ? normalizeSlug(normalizedValue, "communitySlug") : null;
};
