import {
  buildSupporterDigestFallbackRenderedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";

import type {
  AuthenticatedViewer,
  SessionViewerGateway,
  SupporterDigestNarrator,
  SupporterDigestReadRepository,
} from "./ports";
import {
  buildNarratedSupporterDigestResponse,
  listRankedSupporterDigestCandidates,
  type SupporterDigestResponse,
} from "./supporter-digest-response";

export type RefreshSupporterDigestNarrationRequest = {
  sessionToken: string | null;
  windowStart: string;
  windowEnd: string;
};

export type RefreshSupporterDigestNarrationResult =
  | {
      status: "invalid_request";
      message: string;
    }
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
  supporterDigestNarrator: SupporterDigestNarrator;
  supporterDigestReadRepository: SupporterDigestReadRepository;
};

export const refreshSupporterDigestNarration = async (
  dependencies: Dependencies,
  request: RefreshSupporterDigestNarrationRequest,
): Promise<RefreshSupporterDigestNarrationResult> => {
  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );

  if (!viewer) {
    return {
      status: "unauthorized",
      message: "Authentication is required to refresh your digest narration.",
    };
  }

  const windowStart = new Date(request.windowStart);
  if (Number.isNaN(windowStart.getTime())) {
    return {
      status: "invalid_request",
      message: "windowStart must be a valid ISO-8601 timestamp.",
    };
  }

  const windowEnd = new Date(request.windowEnd);
  if (Number.isNaN(windowEnd.getTime())) {
    return {
      status: "invalid_request",
      message: "windowEnd must be a valid ISO-8601 timestamp.",
    };
  }

  if (windowStart.getTime() > windowEnd.getTime()) {
    return {
      status: "invalid_request",
      message: "windowStart cannot be later than windowEnd.",
    };
  }

  const rankedHighlights = await listRankedSupporterDigestCandidates(
    dependencies.supporterDigestReadRepository,
    {
      userId: viewer.userId,
      windowStart,
      windowEnd,
      rankingNow: windowEnd,
    },
  );

  const digest =
    rankedHighlights.length === 0
      ? buildNarratedSupporterDigestResponse({
          rankedHighlights,
          windowStart,
          windowEnd,
          narrationResult: {
            status: "unavailable",
            reason: "invalid_response",
            message: "No highlights were available to narrate.",
          },
        })
      : buildNarratedSupporterDigestResponse({
          rankedHighlights,
          windowStart,
          windowEnd,
          narrationResult:
            await dependencies.supporterDigestNarrator.narrateDigest({
              viewerUserId: viewer.userId,
              windowStart,
              windowEnd,
              highlights: rankedHighlights,
            }),
        });

  if (
    rankedHighlights.length > 0 &&
    digest.narration.status === "unavailable"
  ) {
    await dependencies.analyticsEventPublisher?.publish(
      buildSupporterDigestFallbackRenderedEvent({
        viewerUserId: viewer.userId,
        highlightCount: rankedHighlights.length,
      }),
    );
  }

  return {
    status: "success",
    viewer,
    digest,
  };
};
