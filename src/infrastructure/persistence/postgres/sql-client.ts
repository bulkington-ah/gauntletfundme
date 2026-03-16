export type SqlRow = Record<string, unknown>;

export interface SqlClient {
  query<T extends SqlRow = SqlRow>(
    text: string,
    values?: unknown[],
  ): Promise<{
    rows: T[];
  }>;
}
