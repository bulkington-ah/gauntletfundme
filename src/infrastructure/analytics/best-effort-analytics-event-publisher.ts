import type { AnalyticsEvent, AnalyticsEventPublisher } from "@/application/analytics";

type Dependencies = {
  publisher: AnalyticsEventPublisher;
};

export const createBestEffortAnalyticsEventPublisher = ({
  publisher,
}: Dependencies): AnalyticsEventPublisher => ({
  async publish(event: AnalyticsEvent) {
    try {
      await publisher.publish(event);
    } catch (error) {
      console.error("Analytics event persistence failed.", {
        eventName: event.name,
        error,
      });
    }
  },
});
