import { id, jsonIfNeeded, sql } from '@withtyped/postgres';
import type { JsonObject } from '@withtyped/server';
import decamelize from 'decamelize';

export const insertInto = <T extends JsonObject>(object: T, table: string) => {
  const entries = Object.entries(object);

  return sql`
    insert into ${id(table)}
      (${entries.map(([key]) => id(decamelize(key)))})
      values (${entries.map(([, value]) => jsonIfNeeded(value))})
  `;
};
