import {
  buildDonationIntentStartedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { authorizeProtectedAction } from "@/application/authorization";
import {
  createDonationIntent,
  DomainValidationError,
  normalizeSlug,
  requirePositiveInteger,
} from "@/domain";

import type {
  DonationIntentTargetLookup,
  DonationIntentWriteRepository,
  SessionViewerGateway,
} from "./ports";

export type StartDonationIntentRequest = {
  sessionToken: string | null;
  fundraiserSlug: string;
  amount: number;
};

export type StartDonationIntentResult =
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
      fundraiser: {
        slug: string;
      };
      donationIntent: {
        id: string;
        amount: number;
        status: "started";
        createdAt: string;
      };
      mockedCheckout: true;
    };

type Dependencies = {
  sessionViewerGateway: SessionViewerGateway;
  donationIntentTargetLookup: DonationIntentTargetLookup;
  donationIntentWriteRepository: DonationIntentWriteRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const startDonationIntent = async (
  dependencies: Dependencies,
  request: StartDonationIntentRequest,
): Promise<StartDonationIntentResult> => {
  const validationError = validateStartDonationIntentRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );
  const authorization = authorizeProtectedAction({
    action: "create_donation_intent",
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

  const normalizedFundraiserSlug = normalizeSlug(
    request.fundraiserSlug,
    "fundraiserSlug",
  );
  const fundraiser =
    await dependencies.donationIntentTargetLookup.findFundraiserBySlugForDonationIntent(
      normalizedFundraiserSlug,
    );

  if (!fundraiser) {
    return {
      status: "not_found",
      message: `No fundraiser was found for slug "${normalizedFundraiserSlug}".`,
    };
  }

  const persistedDonationIntent =
    await dependencies.donationIntentWriteRepository.createDonationIntent({
      userId: authorization.viewer.userId,
      fundraiserId: fundraiser.id,
      amount: requirePositiveInteger(request.amount, "amount"),
    });
  const donationIntent = createDonationIntent(persistedDonationIntent);

  await dependencies.analyticsEventPublisher?.publish(
    buildDonationIntentStartedEvent({
      viewerUserId: authorization.viewer.userId,
      fundraiserSlug: fundraiser.slug,
      donationIntentId: donationIntent.id,
      amount: donationIntent.amount,
    }),
  );

  return {
    status: "success",
    viewer: authorization.viewer,
    fundraiser: {
      slug: fundraiser.slug,
    },
    donationIntent: {
      id: donationIntent.id,
      amount: donationIntent.amount,
      status: "started",
      createdAt: donationIntent.createdAt.toISOString(),
    },
    mockedCheckout: true,
  };
};

const validateStartDonationIntentRequest = (
  request: StartDonationIntentRequest,
): StartDonationIntentResult | null => {
  try {
    normalizeSlug(request.fundraiserSlug, "fundraiserSlug");
    requirePositiveInteger(request.amount, "amount");
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
