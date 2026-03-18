import { normalizeEmail } from "@/domain";
import type { SqlClient } from "@/infrastructure/persistence";

import { prototypeLoginAccounts, prototypeLoginPassword } from "./prototype-login-accounts";
import { loadAuthSchemaSql } from "./schema";

type PasswordHashProvider = (password: string) => Promise<string>;

export const ensureAuthSchemaReady = async (sqlClient: SqlClient): Promise<void> => {
  const hasCredentialsTable = await checkTableExists(sqlClient, "auth_credentials");
  const hasSessionsTable = await checkTableExists(sqlClient, "auth_sessions");

  if (!hasCredentialsTable || !hasSessionsTable) {
    await sqlClient.query(loadAuthSchemaSql());
  }
};

export const seedPrototypeLoginCredentials = async (
  sqlClient: SqlClient,
  hashPassword: PasswordHashProvider,
): Promise<void> => {
  for (const account of prototypeLoginAccounts) {
    const existingCredential = await sqlClient.query<{ user_id: string }>(
      `SELECT user_id
       FROM auth_credentials
       WHERE user_id = $1
       LIMIT 1`,
      [account.userId],
    );

    if (existingCredential.rows[0]) {
      continue;
    }

    const matchingUser = await sqlClient.query<{ id: string }>(
      `SELECT id
       FROM users
       WHERE id = $1 AND email = $2
       LIMIT 1`,
      [account.userId, normalizeEmail(account.email)],
    );

    if (!matchingUser.rows[0]) {
      continue;
    }

    const passwordHash = await hashPassword(prototypeLoginPassword);
    await sqlClient.query(
      `INSERT INTO auth_credentials (user_id, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING`,
      [account.userId, passwordHash],
    );
  }
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
