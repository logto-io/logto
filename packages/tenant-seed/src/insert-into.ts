import type { SchemaLike } from '@logto/schemas';
import { sql } from '@silverhand/slonik';
import decamelize from 'decamelize';

import { convertToPrimitiveOrSql } from './sql.js';

/**
 * Build an `insert into` query from the given payload. If the payload is an array, it will insert
 * multiple rows.
 */
export const insertInto = <T extends SchemaLike<string>>(payload: T | T[], table: string) => {
  const first = Array.isArray(payload) ? payload[0] : payload;

  if (!first) {
    throw new Error('Payload cannot be empty');
  }

  const keys = Object.keys(first);
  const values = Array.isArray(payload) ? payload : [payload];

  return sql`
    insert into ${sql.identifier([table])}
    (${sql.join(
      keys.map((key) => sql.identifier([decamelize(key)])),
      sql`, `
    )})
    values ${sql.join(
      values.map(
        (object) =>
          sql`(${sql.join(
            keys.map((key) => convertToPrimitiveOrSql(key, object[key] ?? null)),
            sql`, `
          )})`
      ),
      sql`, `
    )}
  `;
};
