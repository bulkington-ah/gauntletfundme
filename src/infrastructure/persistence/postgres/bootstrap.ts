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
    await ensureFundraiserCommunityLinkage(sqlClient);
    await ensureDonationStorage(sqlClient);
  }
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

const checkColumnExists = async (
  sqlClient: SqlClient,
  tableName: string,
  columnName: string,
): Promise<boolean> => {
  const result = await sqlClient.query<{ has_column: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
         AND column_name = $2
     ) AS has_column`,
    [tableName, columnName],
  );

  return Boolean(result.rows[0]?.has_column);
};

const ensureFundraiserCommunityLinkage = async (
  sqlClient: SqlClient,
): Promise<void> => {
  if (!(await checkTableExists(sqlClient, "fundraisers"))) {
    return;
  }

  if (!(await checkColumnExists(sqlClient, "fundraisers", "community_id"))) {
    await sqlClient.query(`
      ALTER TABLE fundraisers
      ADD COLUMN community_id TEXT REFERENCES communities(id) ON DELETE SET NULL
    `);
  }

  await sqlClient.query(
    `CREATE INDEX IF NOT EXISTS idx_fundraisers_community_id ON fundraisers(community_id)`,
  );

  for (const fundraiser of getPrototypeCatalog().fundraisers) {
    if (!fundraiser.communityId) {
      continue;
    }

    await sqlClient.query(
      `UPDATE fundraisers
       SET community_id = $2
       WHERE id = $1
         AND community_id IS NULL`,
      [fundraiser.id, fundraiser.communityId],
    );
  }
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
