import { existsSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { LogtoConfig, LogtoConfigs } from '@logto/schemas';
import {
  MigrationScript,
  MigrationState,
  migrationStateGuard,
} from '@logto/schemas/migrations/types';
import { conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import { DatabasePool, sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

import { convertToIdentifiers } from '@/database/utils';

import { logtoConfigsTableFilePath, migrationFilesDirectory, migrationStateKey } from './constants';
import { getTimestampFromFileName, migrationFileNameRegex } from './utils';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

export const isLogtoConfigsTableExists = async (pool: DatabasePool) => {
  const { exists } = await pool.one<{ exists: boolean }>(sql`
    select exists (
      select from 
        pg_tables
      where 
        tablename = ${LogtoConfigs.table}
      );
  `);

  return exists;
};

export const getCurrentDatabaseTimestamp = async (pool: DatabasePool) => {
  try {
    const query = await pool.maybeOne<LogtoConfig>(
      sql`select * from ${table} where ${fields.key}=${migrationStateKey}`
    );
    const { timestamp } = migrationStateGuard.parse(query?.value);

    return timestamp;
  } catch {
    return null;
  }
};

export const createLogtoConfigsTable = async (pool: DatabasePool) => {
  const tableQuery = await readFile(logtoConfigsTableFilePath, 'utf8');
  await pool.query(sql`${raw(tableQuery)}`);
};

export const updateDatabaseTimestamp = async (pool: DatabasePool, timestamp: number) => {
  if (!(await isLogtoConfigsTableExists(pool))) {
    await createLogtoConfigsTable(pool);
  }

  const value: MigrationState = {
    timestamp,
    updatedAt: new Date().toISOString(),
  };

  await pool.query(
    sql`
      insert into ${table} (${fields.key}, ${fields.value}) 
        values (${migrationStateKey}, ${JSON.stringify(value)})
        on conflict (${fields.key}) do update set ${fields.value}=excluded.${fields.value}
    `
  );
};

export const getMigrationFiles = async () => {
  if (!existsSync(migrationFilesDirectory)) {
    return [];
  }

  const directory = await readdir(migrationFilesDirectory);
  const files = directory.filter((file) => migrationFileNameRegex.test(file));

  return files;
};

export const getUndeployedMigrations = async (pool: DatabasePool) => {
  const databaseTimestamp = await getCurrentDatabaseTimestamp(pool);
  const files = await getMigrationFiles();

  return files
    .filter((file) => !databaseTimestamp || getTimestampFromFileName(file) > databaseTimestamp)
    .slice()
    .sort((file1, file2) => getTimestampFromFileName(file1) - getTimestampFromFileName(file2));
};

const importMigration = async (file: string): Promise<MigrationScript> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const module = await import(
    path.join(migrationFilesDirectory, file).replace('node_modules/', '')
  );

  // eslint-disable-next-line no-restricted-syntax
  return module.default as MigrationScript;
};

const runMigration = async (pool: DatabasePool, file: string) => {
  const { up } = await importMigration(file);

  try {
    await pool.transaction(async (connect) => {
      await up(connect);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`${chalk.red('[migration]')} run ${file} failed: ${error.message}.`);

      return;
    }

    throw error;
  }

  await updateDatabaseTimestamp(pool, getTimestampFromFileName(file));
  console.log(`${chalk.blue('[migration]')} run ${file} succeeded.`);
};

export const runMigrations = async (pool: DatabasePool) => {
  const migrations = await getUndeployedMigrations(pool);

  console.log(
    `${chalk.blue('[migration]')} found ${migrations.length} migration${conditionalString(
      migrations.length > 1 && 's'
    )}`
  );

  // The await inside the loop is intended, migrations should run in order
  for (const migration of migrations) {
    // eslint-disable-next-line no-await-in-loop
    await runMigration(pool, migration);
  }
};
