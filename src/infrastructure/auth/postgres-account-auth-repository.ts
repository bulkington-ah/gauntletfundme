import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import type { AccountAuthRepository } from "@/application/accounts";
import { createUser, normalizeEmail } from "@/domain";
import { createPersistenceBootstrapper, createPostgresPool } from "@/infrastructure/persistence";
import type { SqlClient } from "@/infrastructure/persistence";

import { prototypeLoginAccounts, prototypeLoginPassword } from "./prototype-login-accounts";
import { loadAuthSchemaSql } from "./schema";

type Dependencies = {
  sqlClient?: SqlClient;
};

const scrypt = promisify(scryptCallback);
const passwordHashLabel = "scrypt";
const sessionDurationInDays = 30;

export const createPostgresAccountAuthRepository = (
  dependencies: Dependencies = {},
): AccountAuthRepository => {
  const sqlClient = dependencies.sqlClient ?? createPostgresPool();
  const persistenceBootstrapper = createPersistenceBootstrapper(sqlClient);
  let authSchemaInitializationPromise: Promise<void> | null = null;

  const ensureReady = async () => {
    await persistenceBootstrapper.ensureReady();

    if (!authSchemaInitializationPromise) {
      authSchemaInitializationPromise = ensureAuthSchemaReady(sqlClient);
    }

    await authSchemaInitializationPromise;
  };

  const query = async <TRow extends Record<string, unknown>>(
    text: string,
    values: unknown[] = [],
  ) => {
    await ensureReady();
    return sqlClient.query<TRow>(text, values);
  };

  return {
    async findUserByEmail(email) {
      const normalizedEmail = normalizeEmail(email);
      const result = await query<UserRow>(
        `SELECT id, email, display_name, role, created_at
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [normalizedEmail],
      );

      return result.rows[0] ? mapUser(result.rows[0]) : null;
    },

    async saveUser(user) {
      await query(
        `INSERT INTO users (id, email, display_name, role, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, user.email, user.displayName, user.role, user.createdAt],
      );
    },

    async setPasswordCredential(userId, password) {
      const passwordHash = await hashPassword(password);
      await query(
        `INSERT INTO auth_credentials (user_id, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (user_id)
         DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [userId, passwordHash],
      );
    },

    async verifyPasswordCredential(userId, password) {
      const result = await query<{ password_hash: string }>(
        `SELECT password_hash
         FROM auth_credentials
         WHERE user_id = $1
         LIMIT 1`,
        [userId],
      );
      const passwordHash = result.rows[0]?.password_hash;

      if (!passwordHash) {
        return false;
      }

      return verifyPassword(password, passwordHash);
    },

    async createSession(userId) {
      const sessionToken = `session_${randomUUID()}`;
      const expiresAt = new Date(
        Date.now() + sessionDurationInDays * 24 * 60 * 60 * 1000,
      );

      await query(
        `INSERT INTO auth_sessions (token, user_id, expires_at)
         VALUES ($1, $2, $3)`,
        [sessionToken, userId, expiresAt],
      );

      return sessionToken;
    },

    async invalidateSession(sessionToken) {
      await query("DELETE FROM auth_sessions WHERE token = $1", [sessionToken]);
    },

    async findViewerBySessionToken(sessionToken) {
      if (!sessionToken) {
        return null;
      }

      const result = await query<SessionViewerRow>(
        `SELECT u.id AS user_id, u.role
         FROM auth_sessions s
         INNER JOIN users u ON u.id = s.user_id
         WHERE s.token = $1 AND s.expires_at > NOW()
         LIMIT 1`,
        [sessionToken],
      );
      const viewerRow = result.rows[0];

      return viewerRow
        ? {
            userId: viewerRow.user_id,
            role: viewerRow.role,
          }
        : null;
    },
  };
};

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  role: "supporter" | "organizer" | "moderator" | "admin";
  created_at: Date | string;
};

type SessionViewerRow = {
  user_id: string;
  role: "supporter" | "organizer" | "moderator" | "admin";
};

const mapUser = (row: UserRow) =>
  createUser({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    createdAt: asDate(row.created_at, "created_at"),
  });

const asDate = (value: string | Date, fieldName: string): Date => {
  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return parsed;
};

const ensureAuthSchemaReady = async (sqlClient: SqlClient): Promise<void> => {
  const hasCredentialsTable = await checkTableExists(sqlClient, "auth_credentials");
  const hasSessionsTable = await checkTableExists(sqlClient, "auth_sessions");

  if (!hasCredentialsTable || !hasSessionsTable) {
    await sqlClient.query(loadAuthSchemaSql());
  }

  await seedPrototypeLoginCredentials(sqlClient);
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

const seedPrototypeLoginCredentials = async (
  sqlClient: SqlClient,
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

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${passwordHashLabel}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
};

const verifyPassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  const [algorithm, saltHex, hashHex] = passwordHash.split("$");

  if (algorithm !== passwordHashLabel || !saltHex || !hashHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedHash = Buffer.from(hashHex, "hex");
  const computedHash = (await scrypt(password, salt, expectedHash.length)) as Buffer;

  if (computedHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(computedHash, expectedHash);
};
