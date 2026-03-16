import {
  requireDate,
  requireNonEmptyString,
} from "@/domain/shared";

export const reportTargetTypes = ["post", "comment"] as const;
export const reportStatuses = [
  "submitted",
  "reviewing",
  "actioned",
  "dismissed",
] as const;

export type ReportTargetType = (typeof reportTargetTypes)[number];
export type ReportStatus = (typeof reportStatuses)[number];

export type Report = {
  id: string;
  reporterUserId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
};

export type CreateReportInput = Report;

export const createReport = (input: CreateReportInput): Report => ({
  id: requireNonEmptyString(input.id, "id"),
  reporterUserId: requireNonEmptyString(input.reporterUserId, "reporterUserId"),
  targetType: input.targetType,
  targetId: requireNonEmptyString(input.targetId, "targetId"),
  reason: requireNonEmptyString(input.reason, "reason"),
  status: input.status,
  createdAt: requireDate(input.createdAt, "createdAt"),
});
