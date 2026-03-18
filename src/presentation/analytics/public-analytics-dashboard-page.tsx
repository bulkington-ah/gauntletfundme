import type { AuthenticatedViewer, AnalyticsDashboard } from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import styles from "./public-analytics-dashboard-page.module.css";

type PublicAnalyticsDashboardPageProps = {
  dashboard: AnalyticsDashboard;
  viewer?: AuthenticatedViewer | null;
  viewerProfileSlug?: string | null;
};

export function PublicAnalyticsDashboardPage({
  dashboard,
  viewer = null,
  viewerProfileSlug = null,
}: PublicAnalyticsDashboardPageProps) {
  return (
    <PublicSiteShell
      returnTo="/analytics"
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Prototype analytics</p>
          <h1 className={styles.heading}>Analytics dashboard</h1>
          <p className={styles.lead}>
            This unlinked dashboard shows persisted application analytics, including
            historical backfill derived from the current prototype data.
          </p>

          <div className={styles.summaryGrid}>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Total events</p>
              <p className={styles.metricValue}>{dashboard.summary.totalEventCount}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Latest event</p>
              <p className={styles.metricTimestamp}>
                {dashboard.summary.latestOccurredAt ?? "No events recorded yet"}
              </p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Grouped counts</p>
            <h2 className={styles.sectionTitle}>Event totals by name</h2>
          </div>

          {dashboard.eventCounts.length === 0 ? (
            <p className={styles.emptyState}>No analytics events recorded yet.</p>
          ) : (
            <div className={styles.eventCountGrid}>
              {dashboard.eventCounts.map((eventCount) => (
                <article className={styles.eventCountCard} key={eventCount.eventName}>
                  <p className={styles.eventName}>{eventCount.eventName}</p>
                  <p className={styles.eventCount}>{eventCount.count}</p>
                  <p className={styles.eventMeta}>
                    Latest event: {eventCount.latestOccurredAt}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Verbatim feed</p>
            <h2 className={styles.sectionTitle}>Newest 100 events</h2>
          </div>

          {dashboard.recentEvents.length === 0 ? (
            <p className={styles.emptyState}>No analytics events recorded yet.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Occurred at</th>
                    <th scope="col">Event</th>
                    <th scope="col">Source</th>
                    <th scope="col">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td className={styles.timestampCell}>
                        <time dateTime={event.occurredAt}>{event.occurredAt}</time>
                      </td>
                      <td className={styles.eventCell}>{event.name}</td>
                      <td className={styles.sourceCell}>
                        {event.sourceTable && event.sourceRecordId
                          ? `${event.sourceTable}:${event.sourceRecordId}`
                          : "runtime"}
                      </td>
                      <td>
                        <pre className={styles.payload}>
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </PublicSiteShell>
  );
}
