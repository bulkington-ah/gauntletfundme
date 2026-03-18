import {
  buildFundraiserPageViewedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { DomainValidationError, normalizeSlug } from "@/domain";

import type {
  LookupBySlugRequest,
  PublicFundraiserResponse,
  PublicQueryResult,
} from "./contracts";
import {
  toPublicCommunityReference,
  toPublicFundraiserSummary,
} from "./mappers";
import type { PublicContentReadRepository } from "./ports";

type Dependencies = {
  publicContentReadRepository: PublicContentReadRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const getPublicFundraiserBySlug = async (
  dependencies: Dependencies,
  request: LookupBySlugRequest,
): Promise<PublicQueryResult<PublicFundraiserResponse>> => {
  const slugResult = normalizeSlugRequest(request.slug);

  if (typeof slugResult !== "string") {
    return slugResult;
  }

  const snapshot =
    await dependencies.publicContentReadRepository.findFundraiserBySlug(slugResult);

  if (!snapshot) {
    return {
      status: "not_found",
      message: `No fundraiser was found for slug "${slugResult}".`,
    };
  }

  await dependencies.analyticsEventPublisher?.publish(
    buildFundraiserPageViewedEvent({
      fundraiserSlug: snapshot.summary.fundraiser.slug,
    }),
  );

  return {
    status: "success",
    data: {
      kind: "fundraiser",
      fundraiser: {
        ...toPublicFundraiserSummary(snapshot.summary),
        story: snapshot.summary.fundraiser.story,
      },
      organizer: {
        displayName: snapshot.summary.owner.displayName,
        role: snapshot.summary.owner.role,
        profileSlug: snapshot.summary.ownerProfile?.slug ?? null,
        avatarUrl: snapshot.summary.ownerProfile?.avatarUrl ?? null,
      },
      community: snapshot.summary.relatedCommunity
        ? toPublicCommunityReference(snapshot.summary.relatedCommunity)
        : null,
      recentDonations: snapshot.recentDonations.map((donation) => ({
        displayName: donation.actor.user.displayName,
        profileSlug: donation.actor.profile?.slug ?? null,
        avatarUrl: donation.actor.profile?.avatarUrl ?? null,
        amount: donation.donation.amount,
        status: donation.donation.status,
        createdAt: donation.donation.createdAt.toISOString(),
      })),
    },
  };
};

const normalizeSlugRequest = (
  slug: string,
): string | PublicQueryResult<PublicFundraiserResponse> => {
  try {
    return normalizeSlug(slug, "slug");
  } catch (error) {
    if (error instanceof DomainValidationError) {
      return {
        status: "invalid_request",
        message: error.message,
      };
    }

    throw error;
  }
};
