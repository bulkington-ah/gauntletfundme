// @vitest-environment node

import { newDb } from "pg-mem";

import { createPersistenceBootstrapper } from "@/infrastructure";

describe("Persistence bootstrapper", () => {
  it("creates schema readiness without seeding prototype catalog rows", async () => {
    const pool = createPool();
    const bootstrapper = createPersistenceBootstrapper(pool);

    await bootstrapper.ensureReady();

    await expect(countRows(pool, "users")).resolves.toBe(0);
    await expect(countRows(pool, "fundraisers")).resolves.toBe(0);
    await expect(countRows(pool, "communities")).resolves.toBe(0);
    await expect(hasTable(pool, "donations")).resolves.toBe(true);
  });

  it("remains idempotent across repeated readiness checks", async () => {
    const pool = createPool();
    const bootstrapper = createPersistenceBootstrapper(pool);

    await bootstrapper.ensureReady();
    await bootstrapper.ensureReady();

    await expect(countRows(pool, "users")).resolves.toBe(0);
    await expect(hasTable(pool, "donations")).resolves.toBe(true);
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
