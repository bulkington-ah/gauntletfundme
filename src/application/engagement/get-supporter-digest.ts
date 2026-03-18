import {
  buildSupporterDigestViewedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";

import type {
  AuthenticatedViewer,
  SessionViewerGateway,
  SupporterDigestReadRepository,
  SupporterDigestStateRepository,
} from "./ports";
import {
  buildInitialSupporterDigestResponse,
  listRankedSupporterDigestCandidates,
  maxDate,
  subtractDays,
  type SupporterDigestResponse,
} from "./supporter-digest-response";

const fallbackWindowDurationInDays = 7;

export type GetSupporterDigestRequest = {
  sessionToken: string | null;
};

export type GetSupporterDigestResult =
  | {
      status: "unauthorized";
      message: string;
    }
  | {
      status: "success";
      viewer: AuthenticatedViewer;
      digest: SupporterDigestResponse;
    };

type Dependencies = {
  analyticsEventPublisher?: AnalyticsEventPublisher;
  sessionViewerGateway: SessionViewerGateway;
  supporterDigestReadRepository: SupporterDigestReadRepository;
  supporterDigestStateRepository: SupporterDigestStateRepository;
  now?: () => Date;
};

export const getSupporterDigest = async (
  dependencies: Dependencies,
  request: GetSupporterDigestRequest,
): Promise<GetSupporterDigestResult> => {
  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );

  if (!viewer) {
    return {
      status: "unauthorized",
      message: "Authentication is required to view your digest.",
    };
  }

  const now = dependencies.now?.() ?? new Date();
  const baseline =
    await dependencies.supporterDigestReadRepository.findSupporterDigestViewerBaseline(
      viewer.userId,
    );

  if (!baseline) {
    throw new Error(
      `Expected a digest baseline for viewer "${viewer.userId}" to exist.`,
    );
  }

  const digestState =
    await dependencies.supporterDigestStateRepository.findSupporterDigestStateByUserId(
      viewer.userId,
    );
  const windowStart =
    digestState?.lastViewedAt ??
    maxDate(
      baseline.viewerCreatedAt,
      subtractDays(now, fallbackWindowDurationInDays),
    );
  const windowEnd = now;
  const rankedHighlights = await listRankedSupporterDigestCandidates(
    dependencies.supporterDigestReadRepository,
    {
      userId: viewer.userId,
      windowStart,
      windowEnd,
      rankingNow: now,
    },
  );
  const digest = buildInitialSupporterDigestResponse({
    rankedHighlights,
    windowStart,
    windowEnd,
  });

  await dependencies.analyticsEventPublisher?.publish(
    buildSupporterDigestViewedEvent({
      viewerUserId: viewer.userId,
      generationMode: digest.generationMode,
      highlightCount: digest.highlights.length,
    }),
  );

  return {
    status: "success",
    viewer,
    digest,
  };
};
