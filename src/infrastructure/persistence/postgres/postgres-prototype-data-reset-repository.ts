import type { PrototypeDataResetRepository } from "@/application";
import {
  ensureAuthSchemaReady,
  hashPassword,
  seedPrototypeLoginCredentials,
} from "@/infrastructure/auth";

import { createPersistenceBootstrapper } from "./bootstrap";
import { createPostgresPool } from "./create-postgres-pool";
import { seedPrototypeCatalog } from "./prototype-catalog-seed";
import type { SqlClient } from "./sql-client";

type Dependencies = {
  sqlClient?: SqlClient;
};

const prototypeResetTableNames = [
  "auth_sessions",
  "auth_credentials",
  "reports",
  "donation_intents",
  "donations",
  "follows",
  "comments",
  "posts",
  "communities",
  "fundraisers",
  "user_profiles",
  "users",
] as const;

export const createPostgresPrototypeDataResetRepository = (
  dependencies: Dependencies = {},
): PrototypeDataResetRepository => {
  const sqlClient = dependencies.sqlClient ?? createPostgresPool();
  const bootstrapper = createPersistenceBootstrapper(sqlClient);

  return {
    async resetPrototypeData() {
      await bootstrapper.ensureReady();
      await ensureAuthSchemaReady(sqlClient);

      await sqlClient.query("BEGIN");

      try {
        for (const tableName of prototypeResetTableNames) {
          if (!(await checkTableExists(sqlClient, tableName))) {
            continue;
          }

          await sqlClient.query(`DELETE FROM ${tableName}`);
        }

        await seedPrototypeCatalog(sqlClient);
        await seedPrototypeLoginCredentials(sqlClient, hashPassword);
        await sqlClient.query("COMMIT");
      } catch (error) {
        await sqlClient.query("ROLLBACK");
        throw error;
      }
    },
  };
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
