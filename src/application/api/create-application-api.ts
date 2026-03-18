import { createPostgresAccountAuthRepository } from "@/infrastructure/auth";
import {
  createBestEffortAnalyticsEventPublisher,
  createPostgresAnalyticsRepository,
} from "@/infrastructure/analytics";
import { createOpenAiSupporterDigestNarrator } from "@/infrastructure/ai";
import { createPostgresPublicContentEngagementRepository } from "@/infrastructure/persistence";

import {
  getSession,
  login,
  logout,
  signUp,
  type LoginRequest,
  type LogoutRequest,
  type LookupSessionRequest,
  type SignUpRequest,
  type AccountAuthRepository,
} from "../accounts";
import {
  getAnalyticsDashboard,
  type AnalyticsDashboardQuery,
  type AnalyticsEventPublisher,
} from "../analytics";
import {
  createCommunityCommand,
  listOwnedCommunitiesForViewer,
  type CommunityWriteRepository,
  type CreateCommunityRequest,
  type ViewerOwnedCommunityQuery,
} from "../communities";
import {
  createCommentCommand,
  createPostCommand,
  type CreateCommentRequest,
  type CreatePostRequest,
  type DiscussionTargetLookup,
  type DiscussionWriteRepository,
} from "../discussion";
import {
  createFundraiserCommand,
  type CreateFundraiserRequest,
  type FundraiserCommunityOwnershipLookup,
  type FundraiserWriteRepository,
} from "../fundraisers";
import {
  followTarget,
  getSupporterDigest,
  recordDigestView,
  startDonationIntent,
  submitDonation,
  type DonationTargetLookup,
  type DonationWriteRepository,
  type SupporterDigestNarrator,
  type SupporterDigestReadRepository,
  type SupporterDigestStateRepository,
  unfollowTarget,
  type FollowTargetRequest,
  type GetSupporterDigestRequest,
  type RecordDigestViewRequest,
  type StartDonationIntentRequest,
  type SubmitDonationRequest,
  type UnfollowTargetRequest,
} from "../engagement";
import {
  getPublicProfileSlugByUserId,
  getPublicCommunityBySlug,
  getPublicFundraiserBySlug,
  getPublicProfileBySlug,
  listPublicCommunities,
  listPublicFundraisers,
  type LookupBySlugRequest,
  type PublicContentReadRepository,
} from "../public-content";
import {
  resetPrototypeData,
  type PrototypeDataResetRepository,
} from "../persistence";
import {
  resolveReport,
  type ReportReviewLookup,
  type ReportReviewWriteRepository,
  submitReport,
  type ReportTargetLookup,
  type ReportWriteRepository,
  type ResolveReportRequest,
  type SubmitReportRequest,
} from "../moderation";
import type {
  DonationIntentTargetLookup,
  DonationIntentWriteRepository,
  DonationTargetLookup as LegacyCompatibleDonationTargetLookup,
  DonationWriteRepository as LegacyCompatibleDonationWriteRepository,
  FollowOwnerLookup,
  FollowTargetLookup,
  FollowWriteRepository,
  SessionViewerGateway,
} from "../engagement";
import { createPostgresPrototypeDataResetRepository } from "@/infrastructure/persistence";

type Dependencies = {
  publicContentReadRepository?: PublicContentReadRepository;
  communityWriteRepository?: CommunityWriteRepository;
  viewerOwnedCommunityQuery?: ViewerOwnedCommunityQuery;
  discussionTargetLookup?: DiscussionTargetLookup;
  discussionWriteRepository?: DiscussionWriteRepository;
  donationTargetLookup?: DonationTargetLookup;
  donationWriteRepository?: DonationWriteRepository;
  fundraiserWriteRepository?: FundraiserWriteRepository;
  fundraiserCommunityOwnershipLookup?: FundraiserCommunityOwnershipLookup;
  donationIntentTargetLookup?: DonationIntentTargetLookup;
  donationIntentWriteRepository?: DonationIntentWriteRepository;
  supporterDigestReadRepository?: SupporterDigestReadRepository;
  supporterDigestStateRepository?: SupporterDigestStateRepository;
  supporterDigestNarrator?: SupporterDigestNarrator;
  reportTargetLookup?: ReportTargetLookup;
  reportWriteRepository?: ReportWriteRepository;
  reportReviewLookup?: ReportReviewLookup;
  reportReviewWriteRepository?: ReportReviewWriteRepository;
  followTargetLookup?: FollowTargetLookup;
  followOwnerLookup?: FollowOwnerLookup;
  followWriteRepository?: FollowWriteRepository;
  analyticsEventPublisher?: AnalyticsEventPublisher;
  analyticsDashboardQuery?: AnalyticsDashboardQuery;
  sessionViewerGateway?: SessionViewerGateway;
  accountAuthRepository?: AccountAuthRepository;
  prototypeDataResetRepository?: PrototypeDataResetRepository;
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

  let accountAuthRepository: AccountAuthRepository | null = null;
  const resolveAccountAuthRepository = () => {
    if (!accountAuthRepository) {
      accountAuthRepository = createPostgresAccountAuthRepository();
    }

    return accountAuthRepository;
  };

  let analyticsRepository:
    | ReturnType<typeof createPostgresAnalyticsRepository>
    | null = null;
  const resolveAnalyticsRepository = () => {
    if (!analyticsRepository) {
      analyticsRepository = createPostgresAnalyticsRepository();
    }

    return analyticsRepository;
  };

  const publicContentReadRepository =
    dependencies.publicContentReadRepository ?? resolvePersistenceAdapter();
  const getCommunityWriteRepository = () =>
    dependencies.communityWriteRepository ?? resolvePersistenceAdapter();
  const getViewerOwnedCommunityQuery = () =>
    dependencies.viewerOwnedCommunityQuery ?? resolvePersistenceAdapter();
  const getDiscussionTargetLookup = () =>
    dependencies.discussionTargetLookup ?? resolvePersistenceAdapter();
  const getDiscussionWriteRepository = () =>
    dependencies.discussionWriteRepository ?? resolvePersistenceAdapter();
  const getDonationTargetLookup = () =>
    (
      dependencies.donationTargetLookup ??
      dependencies.donationIntentTargetLookup ??
      resolvePersistenceAdapter()
    ) as LegacyCompatibleDonationTargetLookup;
  const getDonationWriteRepository = () =>
    (
      dependencies.donationWriteRepository ??
      dependencies.donationIntentWriteRepository ??
      resolvePersistenceAdapter()
    ) as LegacyCompatibleDonationWriteRepository;
  const getFundraiserWriteRepository = () =>
    dependencies.fundraiserWriteRepository ?? resolvePersistenceAdapter();
  const getFundraiserCommunityOwnershipLookup = () =>
    dependencies.fundraiserCommunityOwnershipLookup ?? resolvePersistenceAdapter();
  const getSupporterDigestReadRepository = () =>
    dependencies.supporterDigestReadRepository ?? resolvePersistenceAdapter();
  const getSupporterDigestStateRepository = () =>
    dependencies.supporterDigestStateRepository ?? resolvePersistenceAdapter();
  const getReportTargetLookup = () =>
    dependencies.reportTargetLookup ?? resolvePersistenceAdapter();
  const getReportWriteRepository = () =>
    dependencies.reportWriteRepository ?? resolvePersistenceAdapter();
  const getReportReviewLookup = () =>
    dependencies.reportReviewLookup ?? resolvePersistenceAdapter();
  const getReportReviewWriteRepository = () =>
    dependencies.reportReviewWriteRepository ?? resolvePersistenceAdapter();
  const followTargetLookup =
    dependencies.followTargetLookup ?? resolvePersistenceAdapter();
  const followOwnerLookup =
    dependencies.followOwnerLookup ?? resolvePersistenceAdapter();
  const followWriteRepository =
    dependencies.followWriteRepository ?? resolvePersistenceAdapter();
  const getAccountAuthRepository = () =>
    dependencies.accountAuthRepository ?? resolveAccountAuthRepository();
  const getPrototypeDataResetRepository = () =>
    dependencies.prototypeDataResetRepository ??
    createPostgresPrototypeDataResetRepository();
  const analyticsEventPublisher =
    dependencies.analyticsEventPublisher ??
    createBestEffortAnalyticsEventPublisher({
      publisher: {
        publish: (event) => resolveAnalyticsRepository().publish(event),
      },
    });
  const analyticsDashboardQuery =
    dependencies.analyticsDashboardQuery ?? {
      getDashboard: () => resolveAnalyticsRepository().getDashboard(),
    };
  const supporterDigestNarrator =
    dependencies.supporterDigestNarrator ??
    createOpenAiSupporterDigestNarrator();
  const sessionViewerGateway =
    dependencies.sessionViewerGateway ?? {
      findViewerBySessionToken: (sessionToken: string | null) =>
        getAccountAuthRepository().findViewerBySessionToken(sessionToken),
    };

  return {
    signUp: (request: SignUpRequest) =>
      signUp({ accountAuthRepository: getAccountAuthRepository() }, request),
    login: (request: LoginRequest) =>
      login({ accountAuthRepository: getAccountAuthRepository() }, request),
    logout: (request: LogoutRequest) =>
      logout({ accountAuthRepository: getAccountAuthRepository() }, request),
    getSession: (request: LookupSessionRequest) =>
      getSession({ accountAuthRepository: getAccountAuthRepository() }, request),
    getAnalyticsDashboard: () =>
      getAnalyticsDashboard({
        analyticsDashboardQuery,
      }),
    resetPrototypeData: () =>
      resetPrototypeData({
        prototypeDataResetRepository: getPrototypeDataResetRepository(),
      }),
    getPublicProfileBySlug: (request: LookupBySlugRequest) =>
      getPublicProfileBySlug(
        { publicContentReadRepository, analyticsEventPublisher },
        request,
      ),
    getPublicProfileSlugByUserId: (userId: string) =>
      getPublicProfileSlugByUserId({ publicContentReadRepository }, userId),
    getPublicFundraiserBySlug: (request: LookupBySlugRequest) =>
      getPublicFundraiserBySlug(
        { publicContentReadRepository, analyticsEventPublisher },
        request,
      ),
    getPublicCommunityBySlug: (request: LookupBySlugRequest) =>
      getPublicCommunityBySlug(
        { publicContentReadRepository, analyticsEventPublisher },
        request,
      ),
    listPublicFundraisers: () =>
      listPublicFundraisers({ publicContentReadRepository }),
    listPublicCommunities: () =>
      listPublicCommunities({ publicContentReadRepository }),
    getSupporterDigest: (request: GetSupporterDigestRequest) =>
      getSupporterDigest(
        {
          sessionViewerGateway,
          supporterDigestNarrator,
          supporterDigestReadRepository: getSupporterDigestReadRepository(),
          supporterDigestStateRepository: getSupporterDigestStateRepository(),
          analyticsEventPublisher,
        },
        request,
      ),
    recordDigestView: (request: RecordDigestViewRequest) =>
      recordDigestView(
        {
          sessionViewerGateway,
          supporterDigestStateRepository: getSupporterDigestStateRepository(),
          analyticsEventPublisher,
        },
        request,
      ),
    listOwnedCommunitiesForViewer: (ownerUserId: string) =>
      listOwnedCommunitiesForViewer(
        {
          viewerOwnedCommunityQuery: getViewerOwnedCommunityQuery(),
        },
        ownerUserId,
      ),
    createCommunity: (request: CreateCommunityRequest) =>
      createCommunityCommand(
        {
          sessionViewerGateway,
          communityWriteRepository: getCommunityWriteRepository(),
          analyticsEventPublisher,
        },
        request,
      ),
    createPost: (request: CreatePostRequest) =>
      createPostCommand(
        {
          sessionViewerGateway,
          discussionTargetLookup: getDiscussionTargetLookup(),
          discussionWriteRepository: getDiscussionWriteRepository(),
          analyticsEventPublisher,
        },
        request,
      ),
    createComment: (request: CreateCommentRequest) =>
      createCommentCommand(
        {
          sessionViewerGateway,
          discussionTargetLookup: getDiscussionTargetLookup(),
          discussionWriteRepository: getDiscussionWriteRepository(),
          analyticsEventPublisher,
        },
        request,
      ),
    createFundraiser: (request: CreateFundraiserRequest) =>
      createFundraiserCommand(
        {
          sessionViewerGateway,
          fundraiserWriteRepository: getFundraiserWriteRepository(),
          fundraiserCommunityOwnershipLookup:
            getFundraiserCommunityOwnershipLookup(),
          analyticsEventPublisher,
        },
        request,
      ),
    submitDonation: (request: SubmitDonationRequest) =>
      submitDonation(
        {
          sessionViewerGateway,
          donationTargetLookup: getDonationTargetLookup(),
          donationWriteRepository: getDonationWriteRepository(),
          analyticsEventPublisher,
        },
        request,
      ),
    startDonationIntent: (request: StartDonationIntentRequest) =>
      startDonationIntent(
        {
          sessionViewerGateway,
          donationIntentTargetLookup: getDonationTargetLookup(),
          donationIntentWriteRepository: getDonationWriteRepository(),
          analyticsEventPublisher,
        },
        request,
      ),
    submitReport: (request: SubmitReportRequest) =>
      submitReport(
        {
          sessionViewerGateway,
          reportTargetLookup: getReportTargetLookup(),
          reportWriteRepository: getReportWriteRepository(),
        },
        request,
      ),
    resolveReport: (request: ResolveReportRequest) =>
      resolveReport(
        {
          sessionViewerGateway,
          reportReviewLookup: getReportReviewLookup(),
          reportReviewWriteRepository: getReportReviewWriteRepository(),
        },
        request,
      ),
    followTarget: (request: FollowTargetRequest) =>
      followTarget(
        {
          sessionViewerGateway,
          followTargetLookup,
          followOwnerLookup,
          followWriteRepository,
          analyticsEventPublisher,
        },
        request,
      ),
    unfollowTarget: (request: UnfollowTargetRequest) =>
      unfollowTarget(
        {
          sessionViewerGateway,
          followTargetLookup,
          followWriteRepository,
          analyticsEventPublisher,
        },
        request,
      ),
  };
};

export type ApplicationApi = ReturnType<typeof createApplicationApi>;
