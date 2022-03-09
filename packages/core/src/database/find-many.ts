import { SchemaLike, GeneratedSchema } from '@logto/schemas';
import { DatabasePoolType, sql } from 'slonik';

import { isKeyOf } from '@/utils/schema';

import { FindManyData } from './types';
import { conditionalSql, convertToIdentifiers, convertToPrimitiveOrSql } from './utils';

export const buildFindMany = <Schema extends SchemaLike, ReturnType extends SchemaLike>(
  pool: DatabasePoolType,
  schema: GeneratedSchema<Schema>
) => {
  const { table, fields } = convertToIdentifiers(schema);
  const isKeyOfSchema = isKeyOf(schema);
  const connectKeyValueWithEqualSign = (data: Partial<Schema>) =>
    Object.entries(data)
      .filter((entry): entry is [keyof Schema & string, any] => isKeyOfSchema(entry[0]))
      .map(([key, value]) => sql`${fields[key]}=${convertToPrimitiveOrSql(key, value)}`);

  return async ({ where, limit, offset }: FindManyData<Schema> = {}) => {
    return pool.any<ReturnType>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      ${conditionalSql(
        where,
        (where) => sql`where ${sql.join(connectKeyValueWithEqualSign(where), sql` and `)}`
      )}
      ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
      ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
    `);
  };
};
