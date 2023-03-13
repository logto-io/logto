import type { GeneratedSchema, SchemaLike } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import {
  convertToIdentifiers,
  excludeAutoSetFields,
  convertToPrimitiveOrSql,
  conditionalSql,
} from '@logto/shared';
import { has } from '@silverhand/essentials';
import type { CommonQueryMethods, IdentifierSqlToken } from 'slonik';
import { sql } from 'slonik';

import { InsertionError } from '#src/errors/SlonikError/index.js';
import assertThat from '#src/utils/assert-that.js';

const setExcluded = (...fields: IdentifierSqlToken[]) =>
  sql.join(
    fields.map((field) => sql`${field}=excluded.${field}`),
    sql`, `
  );

type OnConflict = {
  fields: IdentifierSqlToken[];
  setExcludedFields: IdentifierSqlToken[];
};

type InsertIntoConfigReturning = {
  returning: true;
  onConflict?: OnConflict;
};

type InsertIntoConfig = {
  returning?: false;
  onConflict?: OnConflict;
};

type BuildInsertInto = {
  <CreateSchema extends SchemaLike, Schema extends CreateSchema>(
    { fieldKeys, ...rest }: GeneratedSchema<CreateSchema, Schema>,
    config: InsertIntoConfigReturning
  ): (data: OmitAutoSetFields<CreateSchema>) => Promise<Schema>;
  <CreateSchema extends SchemaLike, Schema extends CreateSchema>(
    { fieldKeys, ...rest }: GeneratedSchema<CreateSchema, Schema>,
    config?: InsertIntoConfig
  ): (data: OmitAutoSetFields<CreateSchema>) => Promise<void>;
};

export const buildInsertIntoWithPool =
  (pool: CommonQueryMethods): BuildInsertInto =>
  <CreateSchema extends SchemaLike, Schema extends CreateSchema>(
    schema: GeneratedSchema<CreateSchema, Schema>,
    config?: InsertIntoConfig | InsertIntoConfigReturning
  ) => {
    const { fieldKeys, ...rest } = schema;
    const { table, fields } = convertToIdentifiers(rest);
    const keys = excludeAutoSetFields(fieldKeys);
    const returning = Boolean(config?.returning);
    const onConflict = config?.onConflict;

    return async (data: OmitAutoSetFields<CreateSchema>): Promise<Schema | void> => {
      const insertingKeys = keys.filter((key) => has(data, key));
      const {
        rows: [entry],
      } = await pool.query<Schema>(sql`
        insert into ${table} (${sql.join(
        insertingKeys.map((key) => fields[key]),
        sql`, `
      )})
        values (${sql.join(
          insertingKeys.map((key) => convertToPrimitiveOrSql(key, data[key] ?? null)),
          sql`, `
        )})
        ${conditionalSql(
          onConflict,
          ({ fields, setExcludedFields }) => sql`
            on conflict (${sql.join(fields, sql`, `)}) do update
            set ${setExcluded(...setExcludedFields)}
          `
        )}
        ${conditionalSql(returning, () => sql`returning *`)}
      `);

      assertThat(!returning || entry, new InsertionError<CreateSchema, Schema>(schema, data));

      return entry;
    };
  };
