import { authorizeProtectedAction } from "@/application/authorization";
import {
  createReport,
  DomainValidationError,
  reportTargetTypes,
  type ReportTargetType,
  requireNonEmptyString,
} from "@/domain";

import type {
  ModerationSessionViewerGateway,
  ReportTargetLookup,
  ReportWriteRepository,
} from "./ports";

export type SubmitReportRequest = {
  sessionToken: string | null;
  targetType: string;
  targetId: string;
  reason: string;
};

export type SubmitReportResult =
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
      report: {
        id: string;
        targetType: ReportTargetType;
        targetId: string;
        reason: string;
        status: "submitted";
        createdAt: string;
      };
      created: boolean;
    };

type Dependencies = {
  sessionViewerGateway: ModerationSessionViewerGateway;
  reportTargetLookup: ReportTargetLookup;
  reportWriteRepository: ReportWriteRepository;
};

export const submitReport = async (
  dependencies: Dependencies,
  request: SubmitReportRequest,
): Promise<SubmitReportResult> => {
  const validationError = validateSubmitReportRequest(request);

  if (validationError) {
    return validationError;
  }

  const viewer = await dependencies.sessionViewerGateway.findViewerBySessionToken(
    request.sessionToken,
  );
  const authorization = authorizeProtectedAction({
    action: "report_content",
    viewer,
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

  const normalizedTargetType = request.targetType as ReportTargetType;
  const normalizedTargetId = requireNonEmptyString(request.targetId, "targetId");
  const target = await dependencies.reportTargetLookup.findReportTargetById(
    normalizedTargetType,
    normalizedTargetId,
  );

  if (!target) {
    return {
      status: "not_found",
      message: `No ${normalizedTargetType} was found for id "${normalizedTargetId}".`,
    };
  }

  const writeResult = await dependencies.reportWriteRepository.createReportIfAbsent({
    reporterUserId: authorization.viewer.userId,
    targetType: target.targetType,
    targetId: target.id,
    reason: requireNonEmptyString(request.reason, "reason"),
  });
  const report = createReport(writeResult.report);

  return {
    status: "success",
    viewer: authorization.viewer,
    report: {
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      status: "submitted",
      createdAt: report.createdAt.toISOString(),
    },
    created: writeResult.created,
  };
};

const validateSubmitReportRequest = (
  request: SubmitReportRequest,
): SubmitReportResult | null => {
  if (!reportTargetTypes.includes(request.targetType as ReportTargetType)) {
    return {
      status: "invalid_request",
      message: `targetType must be one of: ${reportTargetTypes.join(", ")}.`,
    };
  }

  try {
    requireNonEmptyString(request.targetId, "targetId");
    requireNonEmptyString(request.reason, "reason");
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
