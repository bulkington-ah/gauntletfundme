import { authorizeProtectedAction } from "@/application/authorization";
import { DomainValidationError, requireNonEmptyString } from "@/domain";

import {
  moderationActions,
  type ModerationAction,
  type ModerationSessionViewerGateway,
  type ReportReviewLookup,
  type ReportReviewWriteRepository,
} from "./ports";

export type ResolveReportRequest = {
  sessionToken: string | null;
  reportId: string;
  action: string;
};

export type ResolveReportResult =
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "unauthorized";
      message: string;
    }
  | {
      status: "forbidden";
      message: string;
    }
  | {
      status: "not_found";
      message: string;
    }
  | {
      status: "success";
      viewer: {
        userId: string;
        role: "supporter" | "organizer" | "moderator" | "admin";
      };
      resolution: {
        reportId: string;
        action: ModerationAction;
        reportStatus: "actioned" | "dismissed";
      };
      target: {
        type: "post" | "comment";
        id: string;
        moderationStatus: "visible" | "flagged" | "removed";
      };
    };

type Dependencies = {
  sessionViewerGateway: ModerationSessionViewerGateway;
  reportReviewLookup: ReportReviewLookup;
  reportReviewWriteRepository: ReportReviewWriteRepository;
};

export const resolveReport = async (
  dependencies: Dependencies,
  request: ResolveReportRequest,
): Promise<ResolveReportResult> => {
  const validationError = validateResolveReportRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );
  const authGate = authorizeProtectedAction({
    action: "moderate_content",
    viewer,
  });

  if (authGate.status === "unauthorized") {
    return {
      status: "unauthorized",
      message: `${authGate.message} Send the x-session-token header to continue.`,
    };
  }

  const normalizedReportId = requireNonEmptyString(request.reportId, "reportId");
  const report = await dependencies.reportReviewLookup.findReportById(normalizedReportId);

  if (!report) {
    return {
      status: "not_found",
      message: `No report was found for id "${normalizedReportId}".`,
    };
  }

  const targetContext = await dependencies.reportReviewLookup.findReportModerationContext(
    report.targetType,
    report.targetId,
  );

  if (!targetContext) {
    return {
      status: "not_found",
      message: `No ${report.targetType} was found for id "${report.targetId}".`,
    };
  }

  const authorization = authorizeProtectedAction({
    action: "moderate_content",
    viewer,
    ownerUserId: targetContext.ownerUserId,
  });

  if (authorization.status !== "authorized") {
    return {
      status: authorization.status,
      message:
        authorization.status === "unauthorized"
          ? `${authorization.message} Send the x-session-token header to continue.`
          : authorization.message,
    };
  }

  const action = request.action as ModerationAction;
  const moderationStatusByAction = {
    hide: "flagged",
    remove: "removed",
    dismiss: targetContext.moderationStatus,
  } as const;
  const reportStatusByAction = {
    hide: "actioned",
    remove: "actioned",
    dismiss: "dismissed",
  } as const;

  const targetModerationStatus = moderationStatusByAction[action];
  const reportStatus = reportStatusByAction[action];

  if (action !== "dismiss") {
    await dependencies.reportReviewWriteRepository.setModerationStatus({
      targetType: report.targetType,
      targetId: report.targetId,
      moderationStatus: targetModerationStatus,
    });
  }

  await dependencies.reportReviewWriteRepository.setReportStatus({
    reportId: report.id,
    status: reportStatus,
  });

  return {
    status: "success",
    viewer: authorization.viewer,
    resolution: {
      reportId: report.id,
      action,
      reportStatus,
    },
    target: {
      type: report.targetType,
      id: report.targetId,
      moderationStatus: targetModerationStatus,
    },
  };
};

const validateResolveReportRequest = (
  request: ResolveReportRequest,
): ResolveReportResult | null => {
  if (!moderationActions.includes(request.action as ModerationAction)) {
    return {
      status: "invalid_request",
      message: `action must be one of: ${moderationActions.join(", ")}.`,
    };
  }

  try {
    requireNonEmptyString(request.reportId, "reportId");
  } catch (error) {
    if (error instanceof DomainValidationError) {
      return {
        status: "invalid_request",
        message: error.message,
      };
    }

    throw error;
  }

  return null;
};
