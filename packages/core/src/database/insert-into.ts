import { SchemaLike, GeneratedSchema } from '@logto/schemas';
import { DatabasePoolType, IdentifierSqlTokenType, sql } from 'slonik';

import assertThat from '@/utils/assert-that';

import {
  conditionalSql,
  convertToIdentifiers,
  convertToPrimitiveOrSql,
  excludeAutoSetFields,
  OmitAutoSetFields,
} from './utils';

const setExcluded = (...fields: IdentifierSqlTokenType[]) =>
  sql.join(
    fields.map((field) => sql`${field}=excluded.${field}`),
    sql`, `
  );

type OnConflict = {
  fields: IdentifierSqlTokenType[];
  setExcludedFields: IdentifierSqlTokenType[];
};

type InsertIntoConfigReturning = {
  returning: true;
  onConflict?: OnConflict;
};

type InsertIntoConfig = {
  returning?: false;
  onConflict?: OnConflict;
};

interface BuildInsertInto {
  <Schema extends SchemaLike, ReturnType extends SchemaLike>(
    pool: DatabasePoolType,
    { fieldKeys, ...rest }: GeneratedSchema<Schema>,
    config: InsertIntoConfigReturning
  ): (data: OmitAutoSetFields<Schema>) => Promise<ReturnType>;
  <Schema extends SchemaLike>(
    pool: DatabasePoolType,
    { fieldKeys, ...rest }: GeneratedSchema<Schema>,
    config?: InsertIntoConfig
  ): (data: OmitAutoSetFields<Schema>) => Promise<void>;
}

export const buildInsertInto: BuildInsertInto = <
  Schema extends SchemaLike,
  ReturnType extends SchemaLike
>(
  pool: DatabasePoolType,
  { fieldKeys, ...rest }: GeneratedSchema<Schema>,
  config?: InsertIntoConfig | InsertIntoConfigReturning
) => {
  const { table, fields } = convertToIdentifiers(rest);
  const keys = excludeAutoSetFields(fieldKeys);
  const returning = Boolean(config?.returning);
  const onConflict = config?.onConflict;

  return async (data: OmitAutoSetFields<Schema>): Promise<ReturnType | void> => {
    const {
      rows: [entry],
    } = await pool.query<ReturnType>(sql`
      insert into ${table} (${sql.join(
      keys.map((key) => fields[key]),
      sql`, `
    )})
      values (${sql.join(
        keys.map((key) => convertToPrimitiveOrSql(key, data[key] ?? null)),
        sql`, `
      )})
      ${conditionalSql(returning, () => sql`returning *`)}
      ${conditionalSql(
        onConflict,
        ({ fields, setExcludedFields }) => sql`
          on conflict (${sql.join(fields, sql`, `)}) do update
          set ${setExcluded(...setExcludedFields)}
        `
      )}
    `);

    assertThat(!returning || entry, 'entity.create_failed', { name: rest.tableSingular });
    return entry;
  };
};
