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
