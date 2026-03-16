import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const coreSchemaFilePath = resolve(
  process.cwd(),
  "src/infrastructure/persistence/schema/core-schema.sql",
);

export const loadCoreSchemaSql = (): string =>
  readFileSync(coreSchemaFilePath, "utf8");
