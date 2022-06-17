import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { SchemaLike, seeds } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import decamelize from 'decamelize';
import { createPool, parseDsn, sql, stringifyDsn } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';
import { raw } from 'slonik-sql-tag-raw';

import { fromRoot } from '@/env-set/parameters';

import { convertToPrimitiveOrSql } from './utils';

const {
  managementResource,
  defaultSignInExperience,
  createDefaultSetting,
  createDemoAppApplication,
  defaultRole,
} = seeds;
const tableDirectory =
  conditionalString(fromRoot && 'packages/core/') + 'node_modules/@logto/schemas/tables';

export const replaceDsnDatabase = (dsn: string, databaseName: string): string =>
  stringifyDsn({ ...parseDsn(dsn), databaseName });

/**
 * Create a database.
 * @returns DSN with the created database name.
 */
export const createDatabase = async (dsn: string, databaseName: string): Promise<string> => {
  const pool = createPool(replaceDsnDatabase(dsn, 'postgres'));

  await pool.query(sql`
    create database ${sql.identifier([databaseName])}
      with
      encoding = 'UTF8'
      connection_limit = -1;
  `);
  await pool.end();

  console.log(`${chalk.blue('[create]')} Database ${databaseName} successfully created.`);

  return replaceDsnDatabase(dsn, databaseName);
};

export const insertInto = <T extends SchemaLike>(object: T, table: string) => {
  const keys = Object.keys(object);

  return sql`
    insert into ${sql.identifier([table])}
    (${sql.join(
      keys.map((key) => sql.identifier([decamelize(key)])),
      sql`, `
    )})
    values (${sql.join(
      keys.map((key) => convertToPrimitiveOrSql(key, object[key] ?? null)),
      sql`, `
    )})
  `;
};

export const createDatabaseCli = (dsn: string, demoAppUrl: string) => {
  const pool = createPool(dsn, { interceptors: createInterceptors() });

  const createTables = async () => {
    const directory = await readdir(tableDirectory);
    const tableFiles = directory.filter((file) => file.endsWith('.sql'));
    const queries = await Promise.all(
      tableFiles.map<Promise<[string, string]>>(async (file) => [
        file,
        await readFile(path.join(tableDirectory, file), 'utf-8'),
      ])
    );

    // Await in loop is intended for better error handling
    for (const [file, query] of queries) {
      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`${raw(query)}`);
      console.log(`${chalk.blue('[create-tables]')} Run ${file} succeeded.`);
    }
  };

  const seedTables = async () => {
    await Promise.all([
      pool.query(insertInto(managementResource, 'resources')),
      pool.query(insertInto(createDefaultSetting(), 'settings')),
      pool.query(insertInto(defaultSignInExperience, 'sign_in_experiences')),
      pool.query(insertInto(createDemoAppApplication([demoAppUrl]), 'applications')),
      pool.query(insertInto(defaultRole, 'roles')),
    ]);
    console.log(`${chalk.blue('[seed-tables]')} Seed tables succeeded.`);
  };

  return { createTables, seedTables, pool };
};
