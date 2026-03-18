import { randomUUID } from "node:crypto";

import {
  analyticsEventNames,
  type AnalyticsDashboard,
  type AnalyticsDashboardEvent,
  type AnalyticsDashboardQuery,
  type AnalyticsEvent,
  type AnalyticsEventCountSummary,
  type AnalyticsEventName,
  type AnalyticsEventPayloadValue,
  type AnalyticsEventPublisher,
} from "@/application/analytics";
import {
  createPersistenceBootstrapper,
  createPostgresPool,
  type SqlClient,
} from "@/infrastructure/persistence";

type Dependencies = {
  sqlClient?: SqlClient;
};

type AnalyticsEventRow = {
  id: string;
  name: AnalyticsEventName;
  payload: Record<string, AnalyticsEventPayloadValue>;
  occurred_at: Date | string;
  source_table: string | null;
  source_record_id: string | null;
};

type FollowBackfillRow = {
  id: string;
  user_id: string;
  target_type: "profile" | "fundraiser" | "community";
  target_id: string;
  target_slug: string | null;
  created_at: Date | string;
};

type PostBackfillRow = {
  id: string;
  author_user_id: string;
  community_slug: string;
  created_at: Date | string;
};

type CommentBackfillRow = {
  id: string;
  post_id: string;
  author_user_id: string;
  created_at: Date | string;
};

type DonationBackfillRow = {
  id: string;
  user_id: string;
  fundraiser_slug: string;
  amount: number;
  created_at: Date | string;
};

const recentEventLimit = 100;

export const createPostgresAnalyticsRepository = (
  dependencies: Dependencies = {},
): AnalyticsEventPublisher & AnalyticsDashboardQuery => {
  const sqlClient = dependencies.sqlClient ?? createPostgresPool();
  const bootstrapper = createPersistenceBootstrapper(sqlClient);
  let initializationPromise: Promise<void> | null = null;

  const ensureReady = async () => {
    if (!initializationPromise) {
      initializationPromise = (async () => {
        await bootstrapper.ensureReady();
        await ensureAnalyticsStorage(sqlClient);
        await backfillHistoricalAnalyticsEvents(sqlClient);
      })();
    }

    await initializationPromise;
  };

  const query = async <TRow extends Record<string, unknown>>(
    text: string,
    values: unknown[] = [],
  ) => {
    await ensureReady();
    return sqlClient.query<TRow>(text, values);
  };

  return {
    async publish(event: AnalyticsEvent) {
      await query(
        `INSERT INTO analytics_events
           (id, name, payload, occurred_at, source_table, source_record_id)
         VALUES ($1, $2, $3::jsonb, $4, NULL, NULL)`,
        [`analytics_${randomUUID()}`, event.name, JSON.stringify(event.payload), event.occurredAt],
      );
    },

    async getDashboard(): Promise<AnalyticsDashboard> {
      const summaryResult = await query<{
        total_event_count: string;
        latest_occurred_at: Date | string | null;
      }>(
        `SELECT
           COUNT(*)::text AS total_event_count,
           MAX(occurred_at) AS latest_occurred_at
         FROM analytics_events`,
      );
      const eventCountsResult = await query<{
        event_name: AnalyticsEventName;
        event_count: string;
        latest_occurred_at: Date | string;
      }>(
        `SELECT
           name AS event_name,
           COUNT(*)::text AS event_count,
           MAX(occurred_at) AS latest_occurred_at
         FROM analytics_events
         GROUP BY name
         ORDER BY COUNT(*) DESC, name ASC`,
      );
      const recentEventsResult = await query<AnalyticsEventRow>(
        `SELECT id, name, payload, occurred_at, source_table, source_record_id
         FROM analytics_events
         ORDER BY occurred_at DESC, id DESC
         LIMIT $1`,
        [recentEventLimit],
      );

      return {
        summary: {
          totalEventCount: Number(summaryResult.rows[0]?.total_event_count ?? "0"),
          latestOccurredAt: toOptionalIsoString(
            summaryResult.rows[0]?.latest_occurred_at ?? null,
          ),
        },
        eventCounts: eventCountsResult.rows.map(
          (row): AnalyticsEventCountSummary => ({
            eventName: row.event_name,
            count: Number(row.event_count),
            latestOccurredAt: toIsoString(row.latest_occurred_at),
          }),
        ),
        recentEvents: recentEventsResult.rows.map(
          (row): AnalyticsDashboardEvent => ({
            id: row.id,
            name: row.name,
            payload: row.payload,
            occurredAt: toIsoString(row.occurred_at),
            sourceTable: row.source_table,
            sourceRecordId: row.source_record_id,
          }),
        ),
      };
    },
  };
};

export const ensureAnalyticsStorage = async (sqlClient: SqlClient): Promise<void> => {
  if (!(await checkTableExists(sqlClient, "analytics_events"))) {
    await sqlClient.query(`
      CREATE TABLE analytics_events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        payload JSONB NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        source_table TEXT,
        source_record_id TEXT
      )
    `);
  }

  await sqlClient.query(
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at
       ON analytics_events(occurred_at DESC, id DESC)`,
  );
  await sqlClient.query(
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_name_occurred_at
       ON analytics_events(name, occurred_at DESC)`,
  );
  await sqlClient.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_source_backfill_uniqueness
       ON analytics_events(name, source_table, source_record_id)`,
  );
};

const checkTableExists = async (
  sqlClient: SqlClient,
  tableName: string,
): Promise<boolean> => {
  const result = await sqlClient.query<{ has_table: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS has_table`,
    [tableName],
  );

  return Boolean(result.rows[0]?.has_table);
};

export const backfillHistoricalAnalyticsEvents = async (
  sqlClient: SqlClient,
): Promise<void> => {
  await backfillFollowEvents(sqlClient);
  await backfillPostEvents(sqlClient);
  await backfillCommentEvents(sqlClient);
  await backfillDonationEvents(sqlClient);
};

const backfillFollowEvents = async (sqlClient: SqlClient): Promise<void> => {
  const result = await sqlClient.query<FollowBackfillRow>(
    `SELECT
       f.id,
       f.user_id,
       f.target_type,
       f.target_id,
       CASE
         WHEN f.target_type = 'profile' THEN p.slug
         WHEN f.target_type = 'fundraiser' THEN fundraiser.slug
         WHEN f.target_type = 'community' THEN community.slug
         ELSE NULL
       END AS target_slug,
       f.created_at AS created_at
     FROM follows f
     LEFT JOIN user_profiles p
       ON f.target_type = 'profile'
      AND p.id = f.target_id
     LEFT JOIN fundraisers fundraiser
       ON f.target_type = 'fundraiser'
      AND fundraiser.id = f.target_id
     LEFT JOIN communities community
       ON f.target_type = 'community'
      AND community.id = f.target_id
     ORDER BY f.created_at ASC, f.id ASC`,
  );
  const followerCounts = new Map<string, number>();

  for (const row of result.rows) {
    if (!row.target_slug) {
      continue;
    }

    const targetKey = `${row.target_type}:${row.target_id}`;
    const nextFollowerCount = (followerCounts.get(targetKey) ?? 0) + 1;
    followerCounts.set(targetKey, nextFollowerCount);

    await insertBackfilledEvent(sqlClient, {
      name: analyticsEventNames.followCompleted,
      payload: {
        viewerUserId: row.user_id,
        targetType: row.target_type,
        targetSlug: row.target_slug,
        created: true,
        followerCount: nextFollowerCount,
      },
      occurredAt: toIsoString(row.created_at),
      sourceTable: "follows",
      sourceRecordId: row.id,
    });
  }
};

const backfillPostEvents = async (sqlClient: SqlClient): Promise<void> => {
  const result = await sqlClient.query<PostBackfillRow>(
    `SELECT
       posts.id,
       posts.author_user_id,
       communities.slug AS community_slug,
       posts.created_at AS created_at
     FROM posts
     INNER JOIN communities ON communities.id = posts.community_id
     ORDER BY posts.created_at ASC, posts.id ASC`,
  );

  for (const row of result.rows) {
    await insertBackfilledEvent(sqlClient, {
      name: analyticsEventNames.postCreated,
      payload: {
        viewerUserId: row.author_user_id,
        communitySlug: row.community_slug,
        postId: row.id,
      },
      occurredAt: toIsoString(row.created_at),
      sourceTable: "posts",
      sourceRecordId: row.id,
    });
  }
};

const backfillCommentEvents = async (sqlClient: SqlClient): Promise<void> => {
  const result = await sqlClient.query<CommentBackfillRow>(
    `SELECT
       comments.id,
       comments.post_id,
       comments.author_user_id,
       comments.created_at AS created_at
     FROM comments
     ORDER BY comments.created_at ASC, comments.id ASC`,
  );

  for (const row of result.rows) {
    await insertBackfilledEvent(sqlClient, {
      name: analyticsEventNames.commentCreated,
      payload: {
        viewerUserId: row.author_user_id,
        postId: row.post_id,
        commentId: row.id,
      },
      occurredAt: toIsoString(row.created_at),
      sourceTable: "comments",
      sourceRecordId: row.id,
    });
  }
};

const backfillDonationEvents = async (sqlClient: SqlClient): Promise<void> => {
  const result = await sqlClient.query<DonationBackfillRow>(
    `SELECT
       donations.id,
       donations.user_id,
       fundraisers.slug AS fundraiser_slug,
       donations.amount,
       donations.created_at AS created_at
     FROM donations
     INNER JOIN fundraisers ON fundraisers.id = donations.fundraiser_id
     ORDER BY donations.created_at ASC, donations.id ASC`,
  );

  for (const row of result.rows) {
    await insertBackfilledEvent(sqlClient, {
      name: analyticsEventNames.donationCompleted,
      payload: {
        viewerUserId: row.user_id,
        fundraiserSlug: row.fundraiser_slug,
        donationId: row.id,
        amount: Number(row.amount),
      },
      occurredAt: toIsoString(row.created_at),
      sourceTable: "donations",
      sourceRecordId: row.id,
    });
  }
};

const insertBackfilledEvent = async (
  sqlClient: SqlClient,
  input: {
    name: AnalyticsEventName;
    payload: Record<string, AnalyticsEventPayloadValue>;
    occurredAt: string;
    sourceTable: string;
    sourceRecordId: string;
  },
): Promise<void> => {
  await sqlClient.query(
    `INSERT INTO analytics_events
       (id, name, payload, occurred_at, source_table, source_record_id)
     VALUES ($1, $2, $3::jsonb, $4, $5, $6)
     ON CONFLICT (name, source_table, source_record_id) DO NOTHING`,
    [
      `analytics_${input.sourceTable}_${input.sourceRecordId}`,
      input.name,
      JSON.stringify(input.payload),
      input.occurredAt,
      input.sourceTable,
      input.sourceRecordId,
    ],
  );
};

const toIsoString = (value: Date | string): string => {
  return value instanceof Date ? value.toISOString() : value;
};

const toOptionalIsoString = (value: Date | string | null): string | null => {
  if (value === null) {
    return null;
  }

  return toIsoString(value);
};
