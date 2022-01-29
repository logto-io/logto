import { SchemaLike, GeneratedSchema } from '@logto/schemas';
import { notFalsy, Truthy } from '@silverhand/essentials';
import { DatabasePoolType, sql } from 'slonik';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';
import { isKeyOf } from '@/utils/schema';

import { conditionalSql, convertToIdentifiers, convertToPrimitiveOrSql } from './utils';

export type UpdateWhereData<Schema extends SchemaLike> = {
  set: Partial<Schema>;
  where: Partial<Schema>;
};

interface BuildUpdateWhere {
  <Schema extends SchemaLike, ReturnType extends SchemaLike>(
    pool: DatabasePoolType,
    schema: GeneratedSchema<Schema>,
    returning: true
  ): (data: UpdateWhereData<Schema>) => Promise<ReturnType>;
  <Schema extends SchemaLike>(
    pool: DatabasePoolType,
    schema: GeneratedSchema<Schema>,
    returning?: false
  ): (data: UpdateWhereData<Schema>) => Promise<void>;
}

export const buildUpdateWhere: BuildUpdateWhere = <
  Schema extends SchemaLike,
  ReturnType extends SchemaLike
>(
  pool: DatabasePoolType,
  schema: GeneratedSchema<Schema>,
  returning = false
) => {
  const { table, fields } = convertToIdentifiers(schema);
  const isKeyOfSchema = isKeyOf(schema);
  const connectKeyValueWithEqualSign = (data: Partial<Schema>) =>
    Object.entries(data)
      .map(([key, value]) => {
        if (!isKeyOfSchema(key)) {
          return;
        }

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          /**
           * Jsonb || operator is used to shallow merge two jsonb types of data
           * all jsonb data field must be non-nullable
           * https://www.postgresql.org/docs/current/functions-json.html
           */
          return sql`${fields[key]}= ${fields[key]} || ${convertToPrimitiveOrSql(key, value)}`;
        }

        return sql`${fields[key]}=${convertToPrimitiveOrSql(key, value)}`;
      })
      .filter((value): value is Truthy<typeof value> => notFalsy(value));

  return async ({ set, where }: UpdateWhereData<Schema>) => {
    const {
      rows: [data],
    } = await pool.query<ReturnType>(sql`
      update ${table}
      set ${sql.join(connectKeyValueWithEqualSign(set), sql`, `)}
      where ${sql.join(connectKeyValueWithEqualSign(where), sql` and `)}
      ${conditionalSql(returning, () => sql`returning *`)}
    `);

    assertThat(
      !returning || data,
      new RequestError({
        code: where.id ? 'entity.not_exists_with_id' : 'entity.not_exists',
        name: schema.tableSingular,
        id: where.id,
        status: 404,
      })
    );

    return data;
  };
};
