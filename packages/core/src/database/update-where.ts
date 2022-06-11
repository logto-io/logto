import { SchemaLike, GeneratedSchema } from '@logto/schemas';
import { notFalsy, Truthy } from '@silverhand/essentials';
import { sql } from 'slonik';

import envSet from '@/env-set';
import { UpdateError } from '@/errors/SlonikError';
import assertThat from '@/utils/assert-that';
import { isKeyOf } from '@/utils/schema';

import { UpdateWhereData } from './types';
import { conditionalSql, convertToIdentifiers, convertToPrimitiveOrSql } from './utils';

interface BuildUpdateWhere {
  <Schema extends SchemaLike, ReturnType extends SchemaLike>(
    schema: GeneratedSchema<Schema>,
    returning: true
  ): (data: UpdateWhereData<Schema>) => Promise<ReturnType>;
  <Schema extends SchemaLike>(schema: GeneratedSchema<Schema>, returning?: false): (
    data: UpdateWhereData<Schema>
  ) => Promise<void>;
}

export const buildUpdateWhere: BuildUpdateWhere = <
  Schema extends SchemaLike,
  ReturnType extends SchemaLike
>(
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

        return sql`${fields[key]}=${convertToPrimitiveOrSql(key, value)}`;
      })
      .filter((value): value is Truthy<typeof value> => notFalsy(value));

  return async ({ set, where }: UpdateWhereData<Schema>) => {
    const {
      rows: [data],
    } = await envSet.pool.query<ReturnType>(sql`
      update ${table}
      set ${sql.join(connectKeyValueWithEqualSign(set), sql`, `)}
      where ${sql.join(connectKeyValueWithEqualSign(where), sql` and `)}
      ${conditionalSql(returning, () => sql`returning *`)}
    `);

    assertThat(!returning || data, new UpdateError(schema, { set, where }));

    return data;
  };
};
