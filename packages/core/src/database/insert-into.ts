import type { GeneratedSchema, SchemaLike } from '@logto/schemas';
import { has } from '@silverhand/essentials';
import type { CommonQueryMethods, IdentifierSqlToken } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { InsertionError } from '#src/errors/SlonikError/index.js';
import assertThat from '#src/utils/assert-that.js';
import {
  type OmitAutoSetFields,
  convertToIdentifiers,
  excludeAutoSetFields,
  convertToPrimitiveOrSql,
  conditionalSql,
} from '#src/utils/sql.js';

const setExcluded = (...fields: IdentifierSqlToken[]) =>
  sql.join(
    fields.map((field) => sql`${field}=excluded.${field}`),
    sql`, `
  );

type OnConflict =
  | {
      fields: IdentifierSqlToken[];
      setExcludedFields: IdentifierSqlToken[];
      ignore?: false;
    }
  | {
      ignore: true;
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
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<Key>>,
    Schema extends SchemaLike<Key>,
  >(
    { fieldKeys, ...rest }: GeneratedSchema<Key, CreateSchema, Schema>,
    config: InsertIntoConfigReturning
  ): (data: OmitAutoSetFields<CreateSchema>) => Promise<Schema>;
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<Key>>,
    Schema extends SchemaLike<Key>,
  >(
    { fieldKeys, ...rest }: GeneratedSchema<Key, CreateSchema, Schema>,
    config?: InsertIntoConfig
  ): (data: OmitAutoSetFields<CreateSchema>) => Promise<void>;
};

export const buildInsertIntoWithPool =
  (pool: CommonQueryMethods): BuildInsertInto =>
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<Key>>,
    Schema extends SchemaLike<Key>,
  >(
    schema: GeneratedSchema<Key, CreateSchema, Schema>,
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
        ${conditionalSql(onConflict, (config) =>
          config.ignore
            ? sql`
              on conflict do nothing
            `
            : sql`
              on conflict (${sql.join(config.fields, sql`, `)}) do update
              set ${setExcluded(...config.setExcludedFields)}
            `
        )}
        ${conditionalSql(returning, () => sql`returning *`)}
      `);

      assertThat(!returning || entry, new InsertionError<Key, CreateSchema, Schema>(schema, data));

      return entry;
    };
  };

type BuildBatchInsertInto = <
  Key extends string,
  CreateSchema extends Partial<SchemaLike<Key>>,
  Schema extends SchemaLike<Key>,
>(
  schema: GeneratedSchema<Key, CreateSchema, Schema>,
  config?: InsertIntoConfig | InsertIntoConfigReturning
) => (data: ReadonlyArray<OmitAutoSetFields<CreateSchema>>) => Promise<readonly Schema[] | void>;

export const buildBatchInsertIntoWithPool =
  (pool: CommonQueryMethods): BuildBatchInsertInto =>
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<Key>>,
    Schema extends SchemaLike<Key>,
  >(
    schema: GeneratedSchema<Key, CreateSchema, Schema>,
    config?: InsertIntoConfig | InsertIntoConfigReturning
  ) => {
    const { fieldKeys, ...rest } = schema;
    const { table, fields } = convertToIdentifiers(rest);
    const keys = excludeAutoSetFields(fieldKeys);
    const returning = Boolean(config?.returning);
    const onConflict = config?.onConflict;

    return async (
      data: ReadonlyArray<OmitAutoSetFields<CreateSchema>>
    ): Promise<readonly Schema[] | void> => {
      if (data.length === 0) {
        return returning ? [] : undefined;
      }

      // Collect keys present in any row.
      const insertingKeys = keys.filter((key) => data.some((row) => has(row, key)));

      const valuesTuples = data.map(
        (row) =>
          sql`(${sql.join(
            insertingKeys.map((key) =>
              has(row, key) ? convertToPrimitiveOrSql(key, row[key] ?? null) : sql`default`
            ),
            sql`, `
          )})`
      );

      const { rows: inserted } = await pool.query<Schema>(sql`
        insert into ${table} (${sql.join(
          insertingKeys.map((key) => fields[key]),
          sql`, `
        )})
        values ${sql.join(valuesTuples, sql`, `)}
        ${conditionalSql(onConflict, (conflictConfig) =>
          conflictConfig.ignore
            ? sql`on conflict do nothing`
            : sql`on conflict (${sql.join(conflictConfig.fields, sql`, `)}) do update set ${setExcluded(
                ...conflictConfig.setExcludedFields
              )}`
        )}
        ${conditionalSql(returning, () => sql`returning *`)}
      `);

      if (returning) {
        return inserted;
      }
    };
  };
