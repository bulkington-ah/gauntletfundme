// @vitest-environment node

import { newDb } from "pg-mem";

import {
  createPostgresAccountAuthRepository,
  createPostgresPrototypeDataResetRepository,
  createPostgresPublicContentEngagementRepository,
  prototypeLoginPassword,
} from "@/infrastructure";

describe("PostgresPrototypeDataResetRepository", () => {
  it("restores the prototype catalog and demo credentials", async () => {
    const { authRepository, publicContentRepository, resetRepository } =
      createRepositoryHarness();

    await resetRepository.resetPrototypeData();

    const profileSnapshot = await publicContentRepository.findProfileBySlug({
      slug: "avery-johnson",
    });
    const fundraiserSnapshot = await publicContentRepository.findFundraiserBySlug({
      slug: "warm-meals-2026",
    });

    expect(profileSnapshot?.user.displayName).toBe("Avery Johnson");
    expect(fundraiserSnapshot?.summary.fundraiser.story).toBe(
      "We are funding weekly hot meal deliveries, pantry restocks, and volunteer prep shifts so families can count on reliable meals each week.",
    );
    expect(
      await authRepository.verifyPasswordCredential(
        "user_organizer_avery",
        prototypeLoginPassword,
      ),
    ).toBe(true);
    expect(
      await authRepository.verifyPasswordCredential(
        "user_supporter_jordan",
        prototypeLoginPassword,
      ),
    ).toBe(true);
  });

  it("clears active auth sessions during reset", async () => {
    const { authRepository, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();
    const sessionToken = await authRepository.createSession("user_organizer_avery");

    expect(await authRepository.findViewerBySessionToken(sessionToken)).toEqual({
      userId: "user_organizer_avery",
      role: "organizer",
    });

    await resetRepository.resetPrototypeData();

    await expect(
      authRepository.findViewerBySessionToken(sessionToken),
    ).resolves.toBeNull();
  });

  it("clears supporter digest cursor state during reset", async () => {
    const { publicContentRepository, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();
    await publicContentRepository.recordSupporterDigestView({
      userId: "user_supporter_jordan",
      viewedThrough: new Date("2026-03-18T12:00:00.000Z"),
    });

    await expect(
      publicContentRepository.findSupporterDigestStateByUserId(
        "user_supporter_jordan",
      ),
    ).resolves.toEqual({
      lastViewedAt: new Date("2026-03-18T12:00:00.000Z"),
    });

    await resetRepository.resetPrototypeData();

    await expect(
      publicContentRepository.findSupporterDigestStateByUserId(
        "user_supporter_jordan",
      ),
    ).resolves.toBeNull();
  });

  it("clears legacy donation intents before removing seeded fundraisers", async () => {
    const { pool, resetRepository } = createRepositoryHarness();

    await resetRepository.resetPrototypeData();
    await pool.query(`CREATE TYPE donation_intent_status AS ENUM ('started')`);
    await pool.query(`
      CREATE TABLE donation_intents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        fundraiser_id TEXT NOT NULL REFERENCES fundraisers(id) ON DELETE RESTRICT,
        amount BIGINT NOT NULL CHECK (amount > 0),
        status donation_intent_status NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(
      `INSERT INTO donation_intents
         (id, user_id, fundraiser_id, amount, status, created_at)
       VALUES
         ('intent_reset_regression', 'user_supporter_jordan', 'fundraiser_warm_meals_2026', 4200, 'started', '2026-03-18T12:30:00.000Z')`,
    );

    await expect(resetRepository.resetPrototypeData()).resolves.toBeUndefined();
    await expect(countRows(pool, "donation_intents")).resolves.toBe(0);
  });
});

const createRepositoryHarness = () => {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  return {
    pool,
    authRepository: createPostgresAccountAuthRepository({
      sqlClient: pool,
    }),
    publicContentRepository: createPostgresPublicContentEngagementRepository({
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
