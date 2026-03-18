import {
  buildCommunityPageViewedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import { DomainValidationError, normalizeSlug } from "@/domain";

import type {
  LookupBySlugRequest,
  PublicCommunityResponse,
  PublicQueryResult,
} from "./contracts";
import { toPublicFundraiserSummary } from "./mappers";
import type { PublicContentReadRepository } from "./ports";

type Dependencies = {
  publicContentReadRepository: PublicContentReadRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
};

export const getPublicCommunityBySlug = async (
  dependencies: Dependencies,
  request: LookupBySlugRequest,
): Promise<PublicQueryResult<PublicCommunityResponse>> => {
  const slugResult = normalizeSlugRequest(request.slug);

  if (typeof slugResult !== "string") {
    return slugResult;
  }

  const snapshot = await dependencies.publicContentReadRepository.findCommunityBySlug(
    slugResult,
  );

  if (!snapshot) {
    return {
      status: "not_found",
      message: `No community was found for slug "${slugResult}".`,
    };
  }

  await dependencies.analyticsEventPublisher?.publish(
    buildCommunityPageViewedEvent({
      communitySlug: snapshot.community.slug,
    }),
  );

  const sortedFundraisers = [...snapshot.fundraisers].sort((left, right) => {
    if (right.amountRaised !== left.amountRaised) {
      return right.amountRaised - left.amountRaised;
    }

    if (right.donationCount !== left.donationCount) {
      return right.donationCount - left.donationCount;
    }

    return (
      right.fundraiser.createdAt.getTime() - left.fundraiser.createdAt.getTime()
    );
  });

  return {
    status: "success",
    data: {
      kind: "community",
      community: {
        slug: snapshot.community.slug,
        name: snapshot.community.name,
        description: snapshot.community.description,
        visibility: snapshot.community.visibility,
        followerCount: snapshot.followerCount,
        fundraiserCount: snapshot.fundraisers.length,
        amountRaised: snapshot.amountRaised,
        donationCount: snapshot.donationCount,
      },
      owner: {
        displayName: snapshot.owner.displayName,
        role: snapshot.owner.role,
        profileSlug: snapshot.ownerProfile?.slug ?? null,
        avatarUrl: snapshot.ownerProfile?.avatarUrl ?? null,
      },
      featuredFundraiser: snapshot.featuredFundraiser
        ? toPublicFundraiserSummary(snapshot.featuredFundraiser)
        : null,
      leaderboard: sortedFundraisers.slice(0, 3).map((fundraiser, index) => ({
        rank: index + 1,
        fundraiser: toPublicFundraiserSummary(fundraiser),
      })),
      fundraisers: sortedFundraisers.map(toPublicFundraiserSummary),
      discussion: snapshot.discussion.map(
        ({ post, author, authorProfile, comments }) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        status: post.status,
        moderationStatus: post.moderationStatus,
        authorDisplayName: author.displayName,
        authorProfileSlug: authorProfile?.slug ?? null,
        createdAt: post.createdAt.toISOString(),
        comments: comments.map(
          ({ comment, author: commentAuthor, authorProfile }) => ({
          id: comment.id,
          body: comment.body,
          moderationStatus: comment.moderationStatus,
          authorDisplayName: commentAuthor.displayName,
          authorProfileSlug: authorProfile?.slug ?? null,
          createdAt: comment.createdAt.toISOString(),
          }),
        ),
        }),
      ),
    },
  };
};

const normalizeSlugRequest = (
  slug: string,
): string | PublicQueryResult<PublicCommunityResponse> => {
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
