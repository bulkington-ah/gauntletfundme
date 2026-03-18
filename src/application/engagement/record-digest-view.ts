import {
  buildSupporterDigestAcknowledgedEvent,
  type AnalyticsEventPublisher,
} from "@/application/analytics";

import type {
  AuthenticatedViewer,
  SessionViewerGateway,
  SupporterDigestStateRepository,
} from "./ports";

const futureSkewToleranceInMinutes = 5;

export type RecordDigestViewRequest = {
  sessionToken: string | null;
  viewedThrough: string;
};

export type RecordDigestViewResult =
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
      viewedThrough: string;
    };

type Dependencies = {
  analyticsEventPublisher?: AnalyticsEventPublisher;
  sessionViewerGateway: SessionViewerGateway;
  supporterDigestStateRepository: SupporterDigestStateRepository;
  now?: () => Date;
};

export const recordDigestView = async (
  dependencies: Dependencies,
  request: RecordDigestViewRequest,
): Promise<RecordDigestViewResult> => {
  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );

  if (!viewer) {
    return {
      status: "unauthorized",
      message: "Authentication is required to acknowledge your digest.",
    };
  }

  const viewedThrough = new Date(request.viewedThrough);

  if (Number.isNaN(viewedThrough.getTime())) {
    return {
      status: "invalid_request",
      message: "viewedThrough must be a valid ISO-8601 timestamp.",
    };
  }

  const now = dependencies.now?.() ?? new Date();
  const maxFutureDate = new Date(
    now.getTime() + futureSkewToleranceInMinutes * 60 * 1000,
  );

  if (viewedThrough.getTime() > maxFutureDate.getTime()) {
    return {
      status: "invalid_request",
      message: "viewedThrough cannot be substantially in the future.",
    };
  }

  await dependencies.supporterDigestStateRepository.recordSupporterDigestView({
    userId: viewer.userId,
    viewedThrough,
  });
  await dependencies.analyticsEventPublisher?.publish(
    buildSupporterDigestAcknowledgedEvent({
      viewerUserId: viewer.userId,
      viewedThrough: viewedThrough.toISOString(),
    }),
  );

  return {
    status: "success",
    viewer,
    viewedThrough: viewedThrough.toISOString(),
  };
};
