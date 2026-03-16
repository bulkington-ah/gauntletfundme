import { DomainValidationError, normalizeSlug } from "@/domain";

import type {
  LookupBySlugRequest,
  PublicCommunityResponse,
  PublicQueryResult,
} from "./contracts";
import type { PublicContentReadRepository } from "./ports";

type Dependencies = {
  publicContentReadRepository: PublicContentReadRepository;
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
      },
      owner: {
        displayName: snapshot.owner.displayName,
        role: snapshot.owner.role,
        profileSlug: snapshot.ownerProfile?.slug ?? null,
      },
      featuredFundraiser: snapshot.featuredFundraiser
        ? {
            slug: snapshot.featuredFundraiser.slug,
            title: snapshot.featuredFundraiser.title,
            status: snapshot.featuredFundraiser.status,
            goalAmount: snapshot.featuredFundraiser.goalAmount,
          }
        : null,
      discussion: snapshot.discussion.map(({ post, author, comments }) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        status: post.status,
        moderationStatus: post.moderationStatus,
        authorDisplayName: author.displayName,
        createdAt: post.createdAt.toISOString(),
        comments: comments.map(({ comment, author: commentAuthor }) => ({
          id: comment.id,
          body: comment.body,
          moderationStatus: comment.moderationStatus,
          authorDisplayName: commentAuthor.displayName,
          createdAt: comment.createdAt.toISOString(),
        })),
      })),
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
