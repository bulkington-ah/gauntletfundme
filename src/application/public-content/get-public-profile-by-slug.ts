import {
  buildProfilePageViewedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { DomainValidationError, normalizeSlug } from "@/domain";

import type {
  LookupBySlugRequest,
  PublicProfileResponse,
  PublicQueryResult,
} from "./contracts";
import type { PublicContentReadRepository } from "./ports";

type Dependencies = {
  publicContentReadRepository: PublicContentReadRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const getPublicProfileBySlug = async (
  dependencies: Dependencies,
  request: LookupBySlugRequest,
): Promise<PublicQueryResult<PublicProfileResponse>> => {
  const slugResult = normalizeSlugRequest(request.slug);

  if (typeof slugResult !== "string") {
    return slugResult;
  }

  const snapshot = await dependencies.publicContentReadRepository.findProfileBySlug(
    slugResult,
  );

  if (!snapshot) {
    return {
      status: "not_found",
      message: `No public profile was found for slug "${slugResult}".`,
    };
  }

  await dependencies.analyticsEventPublisher?.publish(
    buildProfilePageViewedEvent({
      profileSlug: snapshot.profile.slug,
    }),
  );

  return {
    status: "success",
    data: {
      kind: "profile",
      profile: {
        slug: snapshot.profile.slug,
        displayName: snapshot.user.displayName,
        role: snapshot.user.role,
        profileType: snapshot.profile.profileType,
        bio: snapshot.profile.bio,
        avatarUrl: snapshot.profile.avatarUrl,
        followerCount: snapshot.followerCount,
      },
      connections: {
        fundraisers: snapshot.featuredFundraisers.map((fundraiser) => ({
          slug: fundraiser.slug,
          title: fundraiser.title,
          status: fundraiser.status,
          goalAmount: fundraiser.goalAmount,
        })),
        communities: snapshot.ownedCommunities.map((community) => ({
          slug: community.slug,
          name: community.name,
          visibility: community.visibility,
        })),
      },
    },
  };
};

const normalizeSlugRequest = (
  slug: string,
): string | PublicQueryResult<PublicProfileResponse> => {
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
