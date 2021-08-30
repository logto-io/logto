import { notFalsy, Truthy } from '@logto/essentials';
import { SchemaLike, GeneratedSchema } from '@logto/schemas';
import { DatabasePoolType, sql } from 'slonik';

import RequestError from '@/errors/RequestError';
import assert from '@/utils/assert';
import { isKeyOf } from '@/utils/schema';

import { conditionalSql, convertToIdentifiers, convertToPrimitiveOrSql } from './utils';

export type UpdateWhereData<Schema extends SchemaLike> = {
  set: Partial<Schema>;
  where: Partial<Schema>;
};

interface BuildUpdateWhere {
  <Schema extends SchemaLike>(
    pool: DatabasePoolType,
    schema: GeneratedSchema<Schema>,
    returning: true
  ): (data: UpdateWhereData<Schema>) => Promise<Schema>;
  <Schema extends SchemaLike>(
    pool: DatabasePoolType,
    schema: GeneratedSchema<Schema>,
    returning?: false
  ): (data: UpdateWhereData<Schema>) => Promise<void>;
}

export const buildUpdateWhere: BuildUpdateWhere = <Schema extends SchemaLike>(
  pool: DatabasePoolType,
  schema: GeneratedSchema<Schema>,
  returning = false
) => {
  const { table, fields } = convertToIdentifiers(schema);
  const isKeyOfSchema = isKeyOf(schema);
  const connectKeyValueWithEqualSign = (data: Partial<Schema>) =>
    Object.entries(data)
      .map(
        ([key, value]) =>
          isKeyOfSchema(key) && sql`${fields[key]}=${convertToPrimitiveOrSql(key, value)}`
      )
      .filter((value): value is Truthy<typeof value> => notFalsy(value));

  return async ({ set, where }: UpdateWhereData<Schema>) => {
    const {
      rows: [entry],
    } = await pool.query<Schema>(sql`
      update ${table}
      set ${sql.join(connectKeyValueWithEqualSign(set), sql`, `)}
      where ${sql.join(connectKeyValueWithEqualSign(where), sql` and `)}
      ${conditionalSql(returning, () => sql`returning *`)}
    `);

    assert(
      !returning || entry,
      () =>
        new RequestError({
          code: where.id ? 'entity.not_exists_with_id' : 'entity.not_exists',
          name: schema.tableSingular,
          id: where.id,
          status: 404,
        })
    );
    return entry;
  };
};
