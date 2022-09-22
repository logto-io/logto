import { existsSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

import {
  LogtoConfig,
  LogtoConfigs,
  DatabaseVersion,
  databaseVersionGuard,
  MigrationScript,
} from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import { DatabasePool, sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

import { convertToIdentifiers } from '@/database/utils';

import {
  databaseVersionKey,
  logtoConfigsTableFilePath,
  migrationFilesDirectory,
} from './constants';
import { compareVersion, getVersionFromFileName, migrationFileNameRegex } from './utils';

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

export const getCurrentDatabaseVersion = async (pool: DatabasePool) => {
  try {
    const query = await pool.maybeOne<LogtoConfig>(
      sql`select * from ${table} where ${fields.key}=${databaseVersionKey}`
    );
    const databaseVersion = databaseVersionGuard.parse(query?.value);

    return databaseVersion.version;
  } catch {
    return null;
  }
};

export const createLogtoConfigsTable = async (pool: DatabasePool) => {
  const tableQuery = await readFile(logtoConfigsTableFilePath, 'utf8');
  await pool.query(sql`${raw(tableQuery)}`);
};

export const updateDatabaseVersion = async (pool: DatabasePool, version: string) => {
  if (!(await isLogtoConfigsTableExists(pool))) {
    await createLogtoConfigsTable(pool);
  }

  const value: DatabaseVersion = {
    version,
    updatedAt: new Date().toISOString(),
  };

  await pool.query(
    sql`
      insert into ${table} (${fields.key}, ${fields.value}) 
        values (${databaseVersionKey}, ${JSON.stringify(value)})
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
  const databaseVersion = await getCurrentDatabaseVersion(pool);
  const files = await getMigrationFiles();

  return files
    .filter(
      (file) =>
        !databaseVersion || compareVersion(getVersionFromFileName(file), databaseVersion) > 0
    )
    .slice()
    .sort((file1, file2) =>
      compareVersion(getVersionFromFileName(file1), getVersionFromFileName(file2))
    );
};

const importMigration = async (file: string): Promise<MigrationScript> => {
  // eslint-disable-next-line no-restricted-syntax
  const module = (await import(
    path.join(migrationFilesDirectory, file).replace('node_modules/', '')
  )) as MigrationScript;

  return module;
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

  await updateDatabaseVersion(pool, getVersionFromFileName(file));
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
