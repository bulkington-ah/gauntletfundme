import type { SessionViewerGateway } from "@/application/engagement";
import type {
  ModerationStatus,
  Report,
  ReportStatus,
  ReportTargetType,
} from "@/domain";

export type ReportTargetReference = {
  id: string;
  targetType: ReportTargetType;
};

export interface ReportTargetLookup {
  findReportTargetById(
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<ReportTargetReference | null>;
}

export type ReportWriteResult = {
  report: Report;
  created: boolean;
};

export interface ReportWriteRepository {
  createReportIfAbsent(input: {
    reporterUserId: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
  }): Promise<ReportWriteResult>;
}

export const moderationActions = ["hide", "remove", "dismiss"] as const;

export type ModerationAction = (typeof moderationActions)[number];

export type ReportModerationContext = {
  targetType: ReportTargetType;
  targetId: string;
  ownerUserId: string | null;
  moderationStatus: ModerationStatus;
};

export interface ReportReviewLookup {
  findReportById(reportId: string): Promise<Report | null>;
  findReportModerationContext(
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<ReportModerationContext | null>;
}

export interface ReportReviewWriteRepository {
  setModerationStatus(input: {
    targetType: ReportTargetType;
    targetId: string;
    moderationStatus: ModerationStatus;
  }): Promise<void>;
  setReportStatus(input: {
    reportId: string;
    status: ReportStatus;
  }): Promise<void>;
}

export type ModerationSessionViewerGateway = SessionViewerGateway;
