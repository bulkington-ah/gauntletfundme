import type { AnalyticsEventPublisher } from "@/application/analytics";

export const createNoopAnalyticsEventPublisher = (): AnalyticsEventPublisher => ({
  async publish() {
    return;
  },
});
