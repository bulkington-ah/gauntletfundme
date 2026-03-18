import type {
  AnalyticsEventPublisher,
} from "@/application/analytics";

import type {
  DonationIntentTargetLookup,
  DonationIntentWriteRepository,
  SessionViewerGateway,
} from "./ports";
import {
  submitDonation,
  type SubmitDonationRequest,
  type SubmitDonationResult,
} from "./submit-donation";

export type StartDonationIntentRequest = SubmitDonationRequest;

export type StartDonationIntentResult = SubmitDonationResult;

type Dependencies = {
  sessionViewerGateway: SessionViewerGateway;
  donationIntentTargetLookup: DonationIntentTargetLookup;
  donationIntentWriteRepository: DonationIntentWriteRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const startDonationIntent = (
  dependencies: Dependencies,
  request: StartDonationIntentRequest,
): Promise<StartDonationIntentResult> =>
  submitDonation(
    {
      sessionViewerGateway: dependencies.sessionViewerGateway,
      donationTargetLookup: {
        findFundraiserBySlugForDonation: (fundraiserSlug: string) =>
          dependencies.donationIntentTargetLookup.findFundraiserBySlugForDonation?.(
            fundraiserSlug,
          ) ??
          dependencies.donationIntentTargetLookup.findFundraiserBySlugForDonationIntent?.(
            fundraiserSlug,
          ) ??
          Promise.resolve(null),
      },
      donationWriteRepository: {
        createDonation: (input) =>
          dependencies.donationIntentWriteRepository.createDonation?.(input) ??
          dependencies.donationIntentWriteRepository.createDonationIntent?.(input) ??
          Promise.reject(new Error("Donation write repository is not configured.")),
      },
      analyticsEventPublisher: dependencies.analyticsEventPublisher,
    },
    request,
  );
