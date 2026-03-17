import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const authSchemaFilePath = resolve(
  process.cwd(),
  "src/infrastructure/auth/schema/auth-schema.sql",
);

export const loadAuthSchemaSql = (): string => readFileSync(authSchemaFilePath, "utf8");
