import { requireNonEmptyString } from "@/domain";

import type { ViewerOwnedCommunityQuery } from "./ports";

export type ViewerOwnedCommunitySummary = {
  id: string;
  slug: string;
  name: string;
  visibility: "public" | "members_only" | "private";
  createdAt: string;
};

export type ViewerOwnedCommunityListResult = {
  communities: ViewerOwnedCommunitySummary[];
};

type Dependencies = {
  viewerOwnedCommunityQuery: ViewerOwnedCommunityQuery;
};

export const listOwnedCommunitiesForViewer = async (
  dependencies: Dependencies,
  ownerUserId: string,
): Promise<ViewerOwnedCommunityListResult> => {
  const communities =
    await dependencies.viewerOwnedCommunityQuery.listOwnedCommunitiesByOwnerUserId(
      requireNonEmptyString(ownerUserId, "ownerUserId"),
    );

  return {
    communities: communities.map((community) => ({
      id: community.id,
      slug: community.slug,
      name: community.name,
      visibility: community.visibility,
      createdAt: community.createdAt.toISOString(),
    })),
  };
};
