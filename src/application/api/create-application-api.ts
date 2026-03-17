import { createPostgresAccountAuthRepository } from "@/infrastructure/auth";
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
  createCommentCommand,
  createPostCommand,
  type CreateCommentRequest,
  type CreatePostRequest,
  type DiscussionTargetLookup,
  type DiscussionWriteRepository,
} from "../discussion";
import {
  followTarget,
  startDonationIntent,
  unfollowTarget,
  type FollowTargetRequest,
  type StartDonationIntentRequest,
  type UnfollowTargetRequest,
} from "../engagement";
import {
  getPublicCommunityBySlug,
  getPublicFundraiserBySlug,
  getPublicProfileBySlug,
  type LookupBySlugRequest,
  type PublicContentReadRepository,
} from "../public-content";
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
  FollowOwnerLookup,
  FollowTargetLookup,
  FollowWriteRepository,
  SessionViewerGateway,
} from "../engagement";

type Dependencies = {
  publicContentReadRepository?: PublicContentReadRepository;
  discussionTargetLookup?: DiscussionTargetLookup;
  discussionWriteRepository?: DiscussionWriteRepository;
  donationIntentTargetLookup?: DonationIntentTargetLookup;
  donationIntentWriteRepository?: DonationIntentWriteRepository;
  reportTargetLookup?: ReportTargetLookup;
  reportWriteRepository?: ReportWriteRepository;
  reportReviewLookup?: ReportReviewLookup;
  reportReviewWriteRepository?: ReportReviewWriteRepository;
  followTargetLookup?: FollowTargetLookup;
  followOwnerLookup?: FollowOwnerLookup;
  followWriteRepository?: FollowWriteRepository;
  sessionViewerGateway?: SessionViewerGateway;
  accountAuthRepository?: AccountAuthRepository;
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

  const publicContentReadRepository =
    dependencies.publicContentReadRepository ?? resolvePersistenceAdapter();
  const getDiscussionTargetLookup = () =>
    dependencies.discussionTargetLookup ?? resolvePersistenceAdapter();
  const getDiscussionWriteRepository = () =>
    dependencies.discussionWriteRepository ?? resolvePersistenceAdapter();
  const getDonationIntentTargetLookup = () =>
    dependencies.donationIntentTargetLookup ?? resolvePersistenceAdapter();
  const getDonationIntentWriteRepository = () =>
    dependencies.donationIntentWriteRepository ?? resolvePersistenceAdapter();
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
    getPublicProfileBySlug: (request: LookupBySlugRequest) =>
      getPublicProfileBySlug({ publicContentReadRepository }, request),
    getPublicFundraiserBySlug: (request: LookupBySlugRequest) =>
      getPublicFundraiserBySlug({ publicContentReadRepository }, request),
    getPublicCommunityBySlug: (request: LookupBySlugRequest) =>
      getPublicCommunityBySlug({ publicContentReadRepository }, request),
    createPost: (request: CreatePostRequest) =>
      createPostCommand(
        {
          sessionViewerGateway,
          discussionTargetLookup: getDiscussionTargetLookup(),
          discussionWriteRepository: getDiscussionWriteRepository(),
        },
        request,
      ),
    createComment: (request: CreateCommentRequest) =>
      createCommentCommand(
        {
          sessionViewerGateway,
          discussionTargetLookup: getDiscussionTargetLookup(),
          discussionWriteRepository: getDiscussionWriteRepository(),
        },
        request,
      ),
    startDonationIntent: (request: StartDonationIntentRequest) =>
      startDonationIntent(
        {
          sessionViewerGateway,
          donationIntentTargetLookup: getDonationIntentTargetLookup(),
          donationIntentWriteRepository: getDonationIntentWriteRepository(),
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
        },
        request,
      ),
    unfollowTarget: (request: UnfollowTargetRequest) =>
      unfollowTarget(
        {
          sessionViewerGateway,
          followTargetLookup,
          followWriteRepository,
        },
        request,
      ),
  };
};

export type ApplicationApi = ReturnType<typeof createApplicationApi>;
