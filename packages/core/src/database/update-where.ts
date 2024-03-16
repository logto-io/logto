import type { SchemaLike, GeneratedSchema, SchemaValue } from '@logto/schemas';
import type { UpdateWhereData } from '@logto/shared';
import type { Truthy } from '@silverhand/essentials';
import { notFalsy } from '@silverhand/essentials';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { UpdateError } from '#src/errors/SlonikError/index.js';
import assertThat from '#src/utils/assert-that.js';
import { isKeyOf } from '#src/utils/schema.js';
import { convertToIdentifiers, convertToPrimitiveOrSql, conditionalSql } from '#src/utils/sql.js';

type BuildUpdateWhere = {
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<Key>>,
    Schema extends SchemaLike<Key>,
  >(
    schema: GeneratedSchema<Key, CreateSchema, Schema>,
    returning: true
  ): <SetKey extends Key, WhereKey extends Key>(
    data: UpdateWhereData<SetKey, WhereKey>
  ) => Promise<Schema>;
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<Key>>,
    Schema extends SchemaLike<Key>,
  >(
    schema: GeneratedSchema<Key, CreateSchema, Schema>,
    returning?: false
  ): <SetKey extends Key, WhereKey extends Key>(
    data: UpdateWhereData<SetKey, WhereKey>
  ) => Promise<void>;
};

export const buildUpdateWhereWithPool =
  (pool: CommonQueryMethods): BuildUpdateWhere =>
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<Key>>,
    Schema extends SchemaLike<Key>,
  >(
    schema: GeneratedSchema<Key, CreateSchema, Schema>,
    returning = false
  ) => {
    const { table, fields } = convertToIdentifiers(schema);
    const isKeyOfSchema = isKeyOf(schema);
    const connectKeyValueWithEqualSign = <ConnectKey extends Key>(
      data: Partial<SchemaLike<ConnectKey>>,
      jsonbMode: 'replace' | 'merge'
    ) =>
      Object.entries<SchemaValue>(data)
        .map(([key, value]) => {
          if (!isKeyOfSchema(key) || value === undefined) {
            return;
          }

          if (
            jsonbMode === 'merge' &&
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
          ) {
            /**
             * Jsonb || operator is used to shallow merge two jsonb types of data
             * all jsonb data field must be non-nullable
             * https://www.postgresql.org/docs/current/functions-json.html
             */
            return sql`
              ${fields[key]}=
                coalesce(${fields[key]},'{}'::jsonb) || ${convertToPrimitiveOrSql(key, value)}
            `;
          }

          return sql`${fields[key]}=${convertToPrimitiveOrSql(key, value)}`;
        })
        .filter((value): value is Truthy<typeof value> => notFalsy(value));

    return async <SetKey extends Key, WhereKey extends Key>({
      set,
      where,
      jsonbMode,
    }: UpdateWhereData<SetKey, WhereKey>) => {
      const {
        rows: [data],
      } = await pool.query<Schema>(sql`
        update ${table}
        set ${sql.join(connectKeyValueWithEqualSign(set, jsonbMode), sql`, `)}
        where ${sql.join(connectKeyValueWithEqualSign(where, jsonbMode), sql` and `)}
        ${conditionalSql(returning, () => sql`returning *`)}
      `);

      assertThat(!returning || data, new UpdateError(schema, { set, where, jsonbMode }));

      return data;
    };
  };
