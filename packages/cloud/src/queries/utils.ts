import type { PostgresQueryClient } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';
import { RequestError } from '@withtyped/server';

export const getDatabaseName = async (client: PostgresQueryClient) => {
  const {
    rows: [first],
  } = await client.query<{ currentDatabase: string }>(sql`
    select current_database() as "currentDatabase";
  `);

  if (!first) {
    throw new RequestError(undefined, 500);
  }

  return first.currentDatabase.replaceAll('-', '_');
};
