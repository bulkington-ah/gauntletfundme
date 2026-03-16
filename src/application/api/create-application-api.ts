import { createStaticSessionViewerGateway } from "@/infrastructure/auth";
import { createPostgresPublicContentEngagementRepository } from "@/infrastructure/persistence";

import {
  followTarget,
  type FollowTargetRequest,
} from "../engagement";
import {
  getPublicCommunityBySlug,
  getPublicFundraiserBySlug,
  getPublicProfileBySlug,
  type LookupBySlugRequest,
  type PublicContentReadRepository,
} from "../public-content";
import type {
  FollowOwnerLookup,
  FollowTargetLookup,
  FollowWriteRepository,
  SessionViewerGateway,
} from "../engagement";

type Dependencies = {
  publicContentReadRepository?: PublicContentReadRepository;
  followTargetLookup?: FollowTargetLookup;
  followOwnerLookup?: FollowOwnerLookup;
  followWriteRepository?: FollowWriteRepository;
  sessionViewerGateway?: SessionViewerGateway;
};

export const createApplicationApi = (dependencies: Dependencies = {}) => {
  let persistenceAdapter:
    | ReturnType<typeof createPostgresPublicContentEngagementRepository>
    | null = null;
  const resolvePersistenceAdapter = () => {
    if (!persistenceAdapter) {
      persistenceAdapter = createPostgresPublicContentEngagementRepository();
    }

    return persistenceAdapter;
  };

  const publicContentReadRepository =
    dependencies.publicContentReadRepository ?? resolvePersistenceAdapter();
  const followTargetLookup =
    dependencies.followTargetLookup ?? resolvePersistenceAdapter();
  const followOwnerLookup =
    dependencies.followOwnerLookup ?? resolvePersistenceAdapter();
  const followWriteRepository =
    dependencies.followWriteRepository ?? resolvePersistenceAdapter();
  const sessionViewerGateway =
    dependencies.sessionViewerGateway ?? createStaticSessionViewerGateway();

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
          followTargetLookup,
          followOwnerLookup,
          followWriteRepository,
        },
        request,
      ),
  };
};

export type ApplicationApi = ReturnType<typeof createApplicationApi>;
