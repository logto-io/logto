import { readdir, readFile } from 'fs/promises';
import path from 'path';

import chalk from 'chalk';
import { DatabasePool, sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

const tablePath = 'node_modules/@logto/schemas/tables/migrations.sql';
const migrationFilesDirectory = 'node_modules/@logto/schemas/migrations';

const isMigrationTableExists = async (pool: DatabasePool) => {
  const [result] = await pool.anyFirst<[boolean]>(sql`
    select exists (
      select from 
        pg_tables
      where 
        tablename = '_migrations'
      );
  `);

  return result;
};

const createMigrationTableIfNeeded = async (pool: DatabasePool): Promise<boolean> => {
  if (await isMigrationTableExists(pool)) {
    return false;
  }

  const query = await readFile(tablePath, 'utf-8');
  await pool.query(sql`${raw(query)}`);

  return true;
};

type MigrationScript = { up: (pool: DatabasePool) => Promise<void> };

const getMigrationFiles = async () => {
  const directory = await readdir(migrationFilesDirectory);
  const files = directory.filter((file) => file.endsWith('.js'));

  // TODO: compare to _migrations and skip if already applied

  return files;
};

const runMigrationFile = async (pool: DatabasePool, filePath: string) => {
  // eslint-disable-next-line no-restricted-syntax
  const { up } = (await import(
    path.join(migrationFilesDirectory, filePath).replace('node_modules/', '')
  )) as MigrationScript;

  if (typeof up !== 'function') {
    throw new TypeError(`Migration script ${filePath} must export a function named "up"`);
  }

  try {
    await up(pool);
    // TODO: insert success log to _migrations
    console.log(`${chalk.blue('[migration]')} Run ${filePath} succeeded.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      // TODO: insert error log to _migrations
      console.log(`${chalk.red('[migration]')} Run ${filePath} failed: ${error.message}.`);
    }

    throw error;
  }
};

export const deployMigration = async (pool: DatabasePool) => {
  await createMigrationTableIfNeeded(pool);
  const files = await getMigrationFiles();

  // Await in loop is intended to run migrations in order
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    await runMigrationFile(pool, file);
  }
};
