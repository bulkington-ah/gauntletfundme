import type { PublicCommunityListResponse } from "./contracts";
import { toPublicCommunitySummary } from "./mappers";
import type {
  PublicCommunitySummarySnapshot,
  PublicContentReadRepository,
} from "./ports";

type Dependencies = {
  publicContentReadRepository: PublicContentReadRepository;
};

export const listPublicCommunities = async (
  dependencies: Dependencies,
): Promise<PublicCommunityListResponse> => {
  const communities = await dependencies.publicContentReadRepository.listCommunities();

  return {
    kind: "community_list",
    communities: [...communities]
      .sort(compareCommunityBrowsePriority)
      .map(toPublicCommunitySummary),
  };
};

const compareCommunityBrowsePriority = (
  left: PublicCommunitySummarySnapshot,
  right: PublicCommunitySummarySnapshot,
): number => {
  if (right.followerCount !== left.followerCount) {
    return right.followerCount - left.followerCount;
  }

  return right.community.createdAt.getTime() - left.community.createdAt.getTime();
};
