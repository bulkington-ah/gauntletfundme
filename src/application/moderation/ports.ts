import type { SessionViewerGateway } from "@/application/engagement";
import type { Report, ReportTargetType } from "@/domain";

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

export type ModerationSessionViewerGateway = SessionViewerGateway;
