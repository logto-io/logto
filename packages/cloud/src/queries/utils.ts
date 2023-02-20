import type { PostgreSql } from '@withtyped/postgres';
import { sql } from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';
import { RequestError } from '@withtyped/server';

export const getDatabaseName = async (client: Queryable<PostgreSql>) => {
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
