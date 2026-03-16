import { Pool } from "pg";

const databaseUrlEnvironmentKey = "DATABASE_URL";

export const createPostgresPool = (): Pool => {
  const connectionString = process.env[databaseUrlEnvironmentKey];

  if (!connectionString) {
    throw new Error(
      `${databaseUrlEnvironmentKey} is required to create Postgres persistence adapters.`,
    );
  }

  return new Pool({ connectionString });
};
