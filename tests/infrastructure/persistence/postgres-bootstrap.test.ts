// @vitest-environment node

import { newDb } from "pg-mem";

import { createPersistenceBootstrapper } from "@/infrastructure";
import { loadCoreSchemaSql } from "@/infrastructure/persistence/schema";

describe("Persistence bootstrapper", () => {
  it("creates schema readiness without seeding prototype catalog rows", async () => {
    const pool = createPool();
    const bootstrapper = createPersistenceBootstrapper(pool);

    await bootstrapper.ensureReady();

    await expect(countRows(pool, "users")).resolves.toBe(0);
    await expect(countRows(pool, "fundraisers")).resolves.toBe(0);
    await expect(countRows(pool, "communities")).resolves.toBe(0);
    await expect(hasTable(pool, "supporter_digest_state")).resolves.toBe(true);
    await expect(hasTable(pool, "donations")).resolves.toBe(true);
  });

  it("remains idempotent across repeated readiness checks", async () => {
    const pool = createPool();
    const bootstrapper = createPersistenceBootstrapper(pool);

    await bootstrapper.ensureReady();
    await bootstrapper.ensureReady();

    await expect(countRows(pool, "users")).resolves.toBe(0);
    await expect(hasTable(pool, "supporter_digest_state")).resolves.toBe(true);
    await expect(hasTable(pool, "donations")).resolves.toBe(true);
  });

  it("upgrades legacy fundraiser rows with explicit community linkage", async () => {
    const pool = createPool();
    const bootstrapper = createPersistenceBootstrapper(pool);
    const legacySchemaSql = loadCoreSchemaSql()
      .replace(
        "  community_id TEXT REFERENCES communities(id) ON DELETE SET NULL,\n",
        "",
      )
      .replace(
        "CREATE INDEX idx_fundraisers_community_id ON fundraisers(community_id);\n",
        "",
      );

    await pool.query(legacySchemaSql);
    await pool.query(
      `INSERT INTO users (id, email, display_name, role, created_at)
       VALUES ('user_organizer_avery', 'avery.organizer@example.com', 'Avery Johnson', 'organizer', '2026-03-16T08:00:00.000Z')`,
    );
    await pool.query(
      `INSERT INTO communities (id, owner_user_id, slug, name, description, visibility, created_at)
       VALUES
         ('community_neighbors_helping_neighbors', 'user_organizer_avery', 'neighbors-helping-neighbors', 'Neighbors Helping Neighbors', 'A public space for organizer updates, volunteer coordination, and supporter questions.', 'public', '2026-03-16T09:30:00.000Z'),
         ('community_weekend_pantry_crew', 'user_organizer_avery', 'weekend-pantry-crew', 'Weekend Pantry Crew', 'A public hub for pantry packing schedules, volunteer asks, and same-day supply updates.', 'public', '2026-03-16T09:40:00.000Z')`,
    );
    await pool.query(
      `INSERT INTO fundraisers
         (id, owner_user_id, slug, title, story, status, goal_amount, created_at)
       VALUES
         ('fundraiser_warm_meals_2026', 'user_organizer_avery', 'warm-meals-2026', 'Warm Meals 2026', 'We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.', 'active', 250000, '2026-03-16T09:00:00.000Z'),
         ('fundraiser_community_fridge_expansion', 'user_organizer_avery', 'community-fridge-expansion', 'Community Fridge Expansion', 'We are expanding the neighborhood fridge with more cold storage, clearer signage, and regular restock coverage for busy weekends.', 'active', 200000, '2026-03-16T09:25:00.000Z')`,
    );

    await bootstrapper.ensureReady();

    await expect(hasColumn(pool, "fundraisers", "community_id")).resolves.toBe(true);
    await expect(
      readFundraiserCommunityId(pool, "fundraiser_warm_meals_2026"),
    ).resolves.toBe("community_neighbors_helping_neighbors");
    await expect(
      readFundraiserCommunityId(pool, "fundraiser_community_fridge_expansion"),
    ).resolves.toBe("community_weekend_pantry_crew");
  });
});

const createPool = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  return new pg.Pool();
};

const countRows = async (
  pool: ReturnType<typeof createPool>,
  tableName: string,
): Promise<number> => {
  const result = await pool.query<{ row_count: string }>(
    `SELECT COUNT(*)::text AS row_count FROM ${tableName}`,
  );

  return Number(result.rows[0]?.row_count ?? "0");
};

const hasTable = async (
  pool: ReturnType<typeof createPool>,
  tableName: string,
): Promise<boolean> => {
  const result = await pool.query<{ has_table: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS has_table`,
    [tableName],
  );

  return Boolean(result.rows[0]?.has_table);
};

const hasColumn = async (
  pool: ReturnType<typeof createPool>,
  tableName: string,
  columnName: string,
): Promise<boolean> => {
  const result = await pool.query<{ has_column: boolean }>(
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

const readFundraiserCommunityId = async (
  pool: ReturnType<typeof createPool>,
  fundraiserId: string,
): Promise<string | null> => {
  const result = await pool.query<{ community_id: string | null }>(
    `SELECT community_id
     FROM fundraisers
     WHERE id = $1`,
    [fundraiserId],
  );

  return result.rows[0]?.community_id ?? null;
};
