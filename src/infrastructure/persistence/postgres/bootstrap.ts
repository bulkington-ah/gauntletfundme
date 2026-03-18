import { getPrototypeCatalog } from "@/infrastructure/demo-data";
import { loadCoreSchemaSql } from "@/infrastructure/persistence/schema";

import type { SqlClient } from "./sql-client";

type PersistenceBootstrapper = {
  ensureReady(): Promise<void>;
};

export const createPersistenceBootstrapper = (
  sqlClient: SqlClient,
): PersistenceBootstrapper => {
  let initializationPromise: Promise<void> | null = null;

  return {
    ensureReady: () => {
      if (!initializationPromise) {
        initializationPromise = initializePersistence(sqlClient);
      }

      return initializationPromise;
    },
  };
};

const initializePersistence = async (sqlClient: SqlClient): Promise<void> => {
  const hasUsersTable = await checkUsersTableExists(sqlClient);

  if (!hasUsersTable) {
    await sqlClient.query(loadCoreSchemaSql());
  } else {
    await ensureDonationStorage(sqlClient);
  }

  await seedPrototypeCatalog(sqlClient);
};

const checkUsersTableExists = async (sqlClient: SqlClient): Promise<boolean> => {
  return checkTableExists(sqlClient, "users");
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

const ensureDonationStorage = async (sqlClient: SqlClient): Promise<void> => {
  try {
    await sqlClient.query(`CREATE TYPE donation_status AS ENUM ('completed')`);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes('type "donation_status" already exists')
    ) {
      throw error;
    }
  }

  if (!(await checkTableExists(sqlClient, "donations"))) {
    await sqlClient.query(`
      CREATE TABLE donations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        fundraiser_id TEXT NOT NULL REFERENCES fundraisers(id) ON DELETE RESTRICT,
        amount BIGINT NOT NULL CHECK (amount > 0),
        status donation_status NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  await sqlClient.query(
    `CREATE INDEX IF NOT EXISTS idx_donations_fundraiser_id ON donations(fundraiser_id)`,
  );
  await sqlClient.query(
    `CREATE INDEX IF NOT EXISTS idx_donations_user_id_created_at ON donations(user_id, created_at DESC)`,
  );

  if (await checkTableExists(sqlClient, "donation_intents")) {
    await sqlClient.query(`
      INSERT INTO donations (id, user_id, fundraiser_id, amount, status, created_at)
      SELECT id, user_id, fundraiser_id, amount, 'completed'::donation_status, created_at
      FROM donation_intents
      ON CONFLICT (id) DO NOTHING
    `);
  }
};

const seedPrototypeCatalog = async (sqlClient: SqlClient): Promise<void> => {
  const catalog = getPrototypeCatalog();

  for (const user of catalog.users) {
    await sqlClient.query(
      `INSERT INTO users (id, email, display_name, role, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [user.id, user.email, user.displayName, user.role, user.createdAt],
    );
  }

  for (const profile of catalog.userProfiles) {
    await sqlClient.query(
      `INSERT INTO user_profiles
         (id, user_id, slug, bio, avatar_url, profile_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        profile.id,
        profile.userId,
        profile.slug,
        profile.bio,
        profile.avatarUrl,
        profile.profileType,
        profile.createdAt,
      ],
    );
  }

  for (const fundraiser of catalog.fundraisers) {
    await sqlClient.query(
      `INSERT INTO fundraisers
         (id, owner_user_id, slug, title, story, status, goal_amount, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        fundraiser.id,
        fundraiser.ownerUserId,
        fundraiser.slug,
        fundraiser.title,
        fundraiser.story,
        fundraiser.status,
        fundraiser.goalAmount,
        fundraiser.createdAt,
      ],
    );
  }

  for (const community of catalog.communities) {
    await sqlClient.query(
      `INSERT INTO communities
         (id, owner_user_id, slug, name, description, visibility, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        community.id,
        community.ownerUserId,
        community.slug,
        community.name,
        community.description,
        community.visibility,
        community.createdAt,
      ],
    );
  }

  for (const post of catalog.posts) {
    await sqlClient.query(
      `INSERT INTO posts
         (id, community_id, author_user_id, title, body, status, moderation_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        post.id,
        post.communityId,
        post.authorUserId,
        post.title,
        post.body,
        post.status,
        post.moderationStatus,
        post.createdAt,
      ],
    );
  }

  for (const comment of catalog.comments) {
    await sqlClient.query(
      `INSERT INTO comments
         (id, post_id, author_user_id, body, status, moderation_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        comment.id,
        comment.postId,
        comment.authorUserId,
        comment.body,
        comment.status,
        comment.moderationStatus,
        comment.createdAt,
      ],
    );
  }

  for (const follow of catalog.follows) {
    await sqlClient.query(
      `INSERT INTO follows
         (id, user_id, target_type, target_id, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        follow.id,
        follow.userId,
        follow.targetType,
        follow.targetId,
        follow.createdAt,
      ],
    );
  }

  for (const donation of catalog.donations) {
    await sqlClient.query(
      `INSERT INTO donations
         (id, user_id, fundraiser_id, amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        donation.id,
        donation.userId,
        donation.fundraiserId,
        donation.amount,
        donation.status,
        donation.createdAt,
      ],
    );
  }

  for (const report of catalog.reports) {
    await sqlClient.query(
      `INSERT INTO reports
         (id, reporter_user_id, target_type, target_id, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        report.id,
        report.reporterUserId,
        report.targetType,
        report.targetId,
        report.reason,
        report.status,
        report.createdAt,
      ],
    );
  }
};
