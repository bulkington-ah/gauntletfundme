import type { AnalyticsEvent } from "./events";

export interface AnalyticsEventPublisher {
  publish(event: AnalyticsEvent): Promise<void>;
}
