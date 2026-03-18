import type { AnalyticsEvent, AnalyticsEventName, AnalyticsEventPayloadValue } from "./events";

export interface AnalyticsEventPublisher {
  publish(event: AnalyticsEvent): Promise<void>;
}

export type AnalyticsDashboardSummary = {
  totalEventCount: number;
  latestOccurredAt: string | null;
};

export type AnalyticsEventCountSummary = {
  eventName: AnalyticsEventName;
  count: number;
  latestOccurredAt: string;
};

export type AnalyticsDashboardEvent = {
  id: string;
  name: AnalyticsEventName;
  payload: Record<string, AnalyticsEventPayloadValue>;
  occurredAt: string;
  sourceTable: string | null;
  sourceRecordId: string | null;
};

export type AnalyticsDashboard = {
  summary: AnalyticsDashboardSummary;
  eventCounts: AnalyticsEventCountSummary[];
  recentEvents: AnalyticsDashboardEvent[];
};

export interface AnalyticsDashboardQuery {
  getDashboard(): Promise<AnalyticsDashboard>;
}
