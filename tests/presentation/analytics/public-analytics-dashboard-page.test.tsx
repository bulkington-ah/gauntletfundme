import { render, screen } from "@testing-library/react";

import { PublicAnalyticsDashboardPage } from "@/presentation/analytics";

describe("PublicAnalyticsDashboardPage", () => {
  it("renders grouped metrics and a verbatim recent-event feed without adding nav links", () => {
    render(
      <PublicAnalyticsDashboardPage
        dashboard={{
          summary: {
            totalEventCount: 39,
            latestOccurredAt: "2026-03-16T13:20:00.000Z",
          },
          eventCounts: [
            {
              eventName: "engagement.follow.completed",
              count: 20,
              latestOccurredAt: "2026-03-16T12:18:00.000Z",
            },
            {
              eventName: "engagement.donation.completed",
              count: 11,
              latestOccurredAt: "2026-03-16T13:20:00.000Z",
            },
          ],
          recentEvents: [
            {
              id: "analytics_donations_intent_elena_fridge_expansion",
              name: "engagement.donation.completed",
              payload: {
                viewerUserId: "user_supporter_elena",
                fundraiserSlug: "community-fridge-expansion",
                donationId: "intent_elena_fridge_expansion",
                amount: 3500,
              },
              occurredAt: "2026-03-16T13:20:00.000Z",
              sourceTable: "donations",
              sourceRecordId: "intent_elena_fridge_expansion",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Analytics dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total events")).toBeInTheDocument();
    expect(screen.getByText("39")).toBeInTheDocument();
    expect(screen.getByText("engagement.follow.completed")).toBeInTheDocument();
    expect(screen.getByText("Newest 100 events")).toBeInTheDocument();
    expect(
      screen.getByText(/"donationId": "intent_elena_fridge_expansion"/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Analytics" })).not.toBeInTheDocument();
  });
});
