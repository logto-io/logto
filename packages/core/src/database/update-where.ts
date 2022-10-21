import type { SchemaLike, GeneratedSchema } from '@logto/schemas';
import type { UpdateWhereData } from '@logto/shared';
import { convertToIdentifiers, convertToPrimitiveOrSql, conditionalSql } from '@logto/shared';
import type { Truthy } from '@silverhand/essentials';
import { notFalsy } from '@silverhand/essentials';
import { sql } from 'slonik';

import envSet from '@/env-set';
import { UpdateError } from '@/errors/SlonikError';
import assertThat from '@/utils/assert-that';
import { isKeyOf } from '@/utils/schema';

type BuildUpdateWhere = {
  <Schema extends SchemaLike, ReturnType extends SchemaLike>(
    schema: GeneratedSchema<Schema>,
    returning: true
  ): (data: UpdateWhereData<Schema>) => Promise<ReturnType>;
  <Schema extends SchemaLike>(schema: GeneratedSchema<Schema>, returning?: false): (
    data: UpdateWhereData<Schema>
  ) => Promise<void>;
};

export const buildUpdateWhere: BuildUpdateWhere = <
  Schema extends SchemaLike,
  ReturnType extends SchemaLike
>(
  schema: GeneratedSchema<Schema>,
  returning = false
) => {
  const { table, fields } = convertToIdentifiers(schema);
  const isKeyOfSchema = isKeyOf(schema);
  const connectKeyValueWithEqualSign = (data: Partial<Schema>, jsonbMode: 'replace' | 'merge') =>
    Object.entries(data)
      .map(([key, value]) => {
        if (!isKeyOfSchema(key)) {
          return;
        }

        if (jsonbMode === 'merge' && value && typeof value === 'object' && !Array.isArray(value)) {
          /**
           * Jsonb || operator is used to shallow merge two jsonb types of data
           * all jsonb data field must be non-nullable
           * https://www.postgresql.org/docs/current/functions-json.html
           */
          return sql`
            ${fields[key]}=
              coalesce(${fields[key]},'{}'::jsonb)|| ${convertToPrimitiveOrSql(key, value)}
          `;
        }

        return sql`${fields[key]}=${convertToPrimitiveOrSql(key, value)}`;
      })
      .filter((value): value is Truthy<typeof value> => notFalsy(value));

  return async ({ set, where, jsonbMode }: UpdateWhereData<Schema>) => {
    const {
      rows: [data],
    } = await envSet.pool.query<ReturnType>(sql`
      update ${table}
      set ${sql.join(connectKeyValueWithEqualSign(set, jsonbMode), sql`, `)}
      where ${sql.join(connectKeyValueWithEqualSign(where, jsonbMode), sql` and `)}
      ${conditionalSql(returning, () => sql`returning *`)}
    `);

    assertThat(!returning || data, new UpdateError(schema, { set, where, jsonbMode }));

    return data;
  };
};
