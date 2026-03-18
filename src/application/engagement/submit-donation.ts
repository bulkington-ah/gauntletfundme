import {
  buildDonationCompletedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { authorizeProtectedAction } from "@/application/authorization";
import {
  createDonation,
  DomainValidationError,
  normalizeSlug,
  requirePositiveInteger,
} from "@/domain";

import type {
  DonationTargetLookup,
  DonationWriteRepository,
  SessionViewerGateway,
} from "./ports";

export type SubmitDonationRequest = {
  sessionToken: string | null;
  fundraiserSlug: string;
  amount: number;
};

export type SubmitDonationResult =
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
      donation: {
        id: string;
        amount: number;
        status: "completed";
        createdAt: string;
      };
      mockedPaymentProcessor: true;
    };

type Dependencies = {
  sessionViewerGateway: SessionViewerGateway;
  donationTargetLookup: DonationTargetLookup;
  donationWriteRepository: DonationWriteRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const submitDonation = async (
  dependencies: Dependencies,
  request: SubmitDonationRequest,
): Promise<SubmitDonationResult> => {
  const validationError = validateSubmitDonationRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );
  const authorization = authorizeProtectedAction({
    action: "submit_donation",
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
    await dependencies.donationTargetLookup.findFundraiserBySlugForDonation(
      normalizedFundraiserSlug,
    );

  if (!fundraiser) {
    return {
      status: "not_found",
      message: `No fundraiser was found for slug "${normalizedFundraiserSlug}".`,
    };
  }

  const persistedDonation = await dependencies.donationWriteRepository.createDonation({
    userId: authorization.viewer.userId,
    fundraiserId: fundraiser.id,
    amount: requirePositiveInteger(request.amount, "amount"),
  });
  const donation = createDonation(persistedDonation);

  await dependencies.analyticsEventPublisher?.publish(
    buildDonationCompletedEvent({
      viewerUserId: authorization.viewer.userId,
      fundraiserSlug: fundraiser.slug,
      donationId: donation.id,
      amount: donation.amount,
    }),
  );

  return {
    status: "success",
    viewer: authorization.viewer,
    fundraiser: {
      slug: fundraiser.slug,
    },
    donation: {
      id: donation.id,
      amount: donation.amount,
      status: "completed",
      createdAt: donation.createdAt.toISOString(),
    },
    mockedPaymentProcessor: true,
  };
};

const validateSubmitDonationRequest = (
  request: SubmitDonationRequest,
): SubmitDonationResult | null => {
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
