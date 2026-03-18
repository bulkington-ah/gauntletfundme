// @vitest-environment node

import { newDb } from "pg-mem";

import { analyticsEventNames } from "@/application";
import {
  createPostgresPrototypeDataResetRepository,
  backfillHistoricalAnalyticsEvents,
  createPostgresAnalyticsRepository,
} from "@/infrastructure";

describe("PostgresAnalyticsRepository", () => {
  it("backfills seeded persisted events for the prototype dataset", async () => {
    const { analyticsRepository, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();

    const dashboard = await analyticsRepository.getDashboard();

    expect(dashboard.summary.totalEventCount).toBe(39);
    expect(dashboard.eventCounts).toEqual([
      {
        eventName: analyticsEventNames.followCompleted,
        count: 20,
        latestOccurredAt: "2026-03-16T12:18:00.000Z",
      },
      {
        eventName: analyticsEventNames.donationCompleted,
        count: 11,
        latestOccurredAt: "2026-03-16T13:20:00.000Z",
      },
      {
        eventName: analyticsEventNames.commentCreated,
        count: 4,
        latestOccurredAt: "2026-03-16T11:35:00.000Z",
      },
      {
        eventName: analyticsEventNames.postCreated,
        count: 4,
        latestOccurredAt: "2026-03-16T11:15:00.000Z",
      },
    ]);
    expect(dashboard.recentEvents[0]).toMatchObject({
      name: analyticsEventNames.donationCompleted,
      occurredAt: "2026-03-16T13:20:00.000Z",
      sourceTable: "donations",
      sourceRecordId: "intent_elena_fridge_expansion",
    });
  });

  it("reconstructs follower counts for backfilled follow events using the source timestamps", async () => {
    const { pool, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();

    const result = await pool.query<{
      payload: { followerCount: number; targetSlug: string };
      occurred_at: Date;
    }>(
      `SELECT payload, occurred_at
       FROM analytics_events
       WHERE name = $1
         AND source_table = 'follows'
         AND source_record_id = $2
       LIMIT 1`,
      [analyticsEventNames.followCompleted, "follow_profile_priya_to_avery"],
    );

    expect(result.rows[0]).toEqual({
      payload: {
        viewerUserId: "user_supporter_priya",
        targetType: "profile",
        targetSlug: "avery-johnson",
        created: true,
        followerCount: 4,
      },
      occurred_at: new Date("2026-03-16T12:04:00.000Z"),
    });
  });

  it("keeps historical backfill idempotent when rerun", async () => {
    const { pool, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();
    const rowCountBefore = await countRows(pool, "analytics_events");

    await backfillHistoricalAnalyticsEvents(pool);

    expect(rowCountBefore).toBe(39);
    await expect(countRows(pool, "analytics_events")).resolves.toBe(39);
  });

  it("persists live events and limits the recent dashboard feed to 100 rows", async () => {
    const { analyticsRepository, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();

    for (let index = 0; index < 105; index += 1) {
      await analyticsRepository.publish({
        name: analyticsEventNames.profilePageViewed,
        payload: {
          profileSlug: `viewer-${index}`,
        },
        occurredAt: new Date(Date.UTC(2026, 2, 18, 12, index, 0)).toISOString(),
      });
    }

    const dashboard = await analyticsRepository.getDashboard();

    expect(dashboard.summary.totalEventCount).toBe(144);
    expect(dashboard.recentEvents).toHaveLength(100);
    expect(dashboard.recentEvents[0]).toMatchObject({
      name: analyticsEventNames.profilePageViewed,
      occurredAt: "2026-03-18T13:44:00.000Z",
      payload: {
        profileSlug: "viewer-104",
      },
      sourceTable: null,
      sourceRecordId: null,
    });
    expect(dashboard.eventCounts[0]).toEqual({
      eventName: analyticsEventNames.profilePageViewed,
      count: 105,
      latestOccurredAt: "2026-03-18T13:44:00.000Z",
    });
  });
});

const createRepositoryHarness = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  return {
    pool,
    analyticsRepository: createPostgresAnalyticsRepository({
      sqlClient: pool,
    }),
    resetRepository: createPostgresPrototypeDataResetRepository({
      sqlClient: pool,
    }),
  };
};

const countRows = async (
  pool: ReturnType<typeof createRepositoryHarness>["pool"],
  tableName: string,
): Promise<number> => {
  const result = await pool.query<{ row_count: string }>(
    `SELECT COUNT(*)::text AS row_count FROM ${tableName}`,
  );

  return Number(result.rows[0]?.row_count ?? "0");
};
