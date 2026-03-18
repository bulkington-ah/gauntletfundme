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
import {
  toPublicActorSummary,
  toPublicCommunityReference,
  toPublicFundraiserSummary,
} from "./mappers";
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
        followingCount: snapshot.followingCount,
        inspiredSupporterCount: snapshot.inspiredSupporterCount,
      },
      connections: {
        fundraisers: snapshot.featuredFundraisers.map(toPublicFundraiserSummary),
        communities: snapshot.ownedCommunities.map(toPublicCommunityReference),
      },
      recentActivity: snapshot.recentActivity.map((entry) => {
        switch (entry.type) {
          case "fundraiser_donation":
            return {
              id: entry.donation.id,
              type: entry.type,
              actor: toPublicActorSummary(entry.actor),
              createdAt: entry.donation.createdAt.toISOString(),
              summary: `${entry.actor.user.displayName} donated`,
              detail: entry.fundraiser.fundraiser.title,
              fundraiser: toPublicFundraiserSummary(entry.fundraiser),
              community: entry.community
                ? toPublicCommunityReference(entry.community)
                : null,
              amount: entry.donation.amount,
            };
          case "community_post":
            return {
              id: entry.post.id,
              type: entry.type,
              actor: toPublicActorSummary(entry.actor),
              createdAt: entry.post.createdAt.toISOString(),
              summary: entry.post.title,
              detail: entry.post.body,
              fundraiser: null,
              community: toPublicCommunityReference(entry.community),
              amount: null,
            };
        }
      }),
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
