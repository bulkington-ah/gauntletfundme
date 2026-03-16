import { DomainValidationError, normalizeSlug } from "@/domain";

import type {
  LookupBySlugRequest,
  PublicFundraiserResponse,
  PublicQueryResult,
} from "./contracts";
import type { PublicContentReadRepository } from "./ports";

type Dependencies = {
  publicContentReadRepository: PublicContentReadRepository;
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

  return {
    status: "success",
    data: {
      kind: "fundraiser",
      fundraiser: {
        slug: snapshot.fundraiser.slug,
        title: snapshot.fundraiser.title,
        story: snapshot.fundraiser.story,
        status: snapshot.fundraiser.status,
        goalAmount: snapshot.fundraiser.goalAmount,
        donationIntentCount: snapshot.donationIntentCount,
      },
      organizer: {
        displayName: snapshot.owner.displayName,
        role: snapshot.owner.role,
        profileSlug: snapshot.ownerProfile?.slug ?? null,
      },
      community: snapshot.relatedCommunity
        ? {
            slug: snapshot.relatedCommunity.slug,
            name: snapshot.relatedCommunity.name,
            visibility: snapshot.relatedCommunity.visibility,
          }
        : null,
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
