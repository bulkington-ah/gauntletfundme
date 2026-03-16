import { createStaticSessionViewerGateway } from "@/infrastructure/auth";
import { createStaticPublicContentRepository } from "@/infrastructure/public-content";

import {
  followTarget,
  type FollowTargetRequest,
} from "../engagement";
import {
  getPublicCommunityBySlug,
  getPublicFundraiserBySlug,
  getPublicProfileBySlug,
  type LookupBySlugRequest,
} from "../public-content";

export const createApplicationApi = () => {
  const publicContentReadRepository = createStaticPublicContentRepository();
  const sessionViewerGateway = createStaticSessionViewerGateway();

  return {
    getPublicProfileBySlug: (request: LookupBySlugRequest) =>
      getPublicProfileBySlug({ publicContentReadRepository }, request),
    getPublicFundraiserBySlug: (request: LookupBySlugRequest) =>
      getPublicFundraiserBySlug({ publicContentReadRepository }, request),
    getPublicCommunityBySlug: (request: LookupBySlugRequest) =>
      getPublicCommunityBySlug({ publicContentReadRepository }, request),
    followTarget: (request: FollowTargetRequest) =>
      followTarget(
        {
          sessionViewerGateway,
          followTargetLookup: publicContentReadRepository,
        },
        request,
      ),
  };
};

export type ApplicationApi = ReturnType<typeof createApplicationApi>;
