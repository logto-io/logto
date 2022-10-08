import { existsSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

import {
  LogtoConfig,
  LogtoConfigs,
  AlterationState,
  alterationStateGuard,
  LogtoConfigKey,
} from '@logto/schemas';
import { AlterationScript } from '@logto/schemas/lib/types/alteration';
import { conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import { copy, remove } from 'fs-extra';
import { DatabasePool, sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

import { convertToIdentifiers } from '@/database/utils';

import {
  logtoConfigsTableFilePath,
  alterationFilesDirectory,
  alterationFilesDirectorySource,
} from './constants';
import { getTimestampFromFileName, alterationFileNameRegex } from './utils';

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
      sql`select * from ${table} where ${fields.key}=${LogtoConfigKey.AlterationState}`
    );
    const { timestamp } = alterationStateGuard.parse(query?.value);

    return timestamp;
  } catch {
    return null;
  }
};

export const createLogtoConfigsTable = async (pool: DatabasePool) => {
  const tableQuery = await readFile(logtoConfigsTableFilePath, 'utf8');
  await pool.query(sql`${raw(tableQuery)}`);
};

export const updateDatabaseTimestamp = async (pool: DatabasePool, timestamp?: number) => {
  if (!(await isLogtoConfigsTableExists(pool))) {
    await createLogtoConfigsTable(pool);
  }

  const value: AlterationState = {
    timestamp: timestamp ?? (await getLatestAlterationTimestamp()),
    updatedAt: new Date().toISOString(),
  };

  await pool.query(
    sql`
      insert into ${table} (${fields.key}, ${fields.value}) 
        values (${LogtoConfigKey.AlterationState}, ${sql.jsonb(value)})
        on conflict (${fields.key}) do update set ${fields.value}=excluded.${fields.value}
    `
  );
};

export const getLatestAlterationTimestamp = async () => {
  const files = await getAlterationFiles();

  const latestFile = files[files.length - 1];

  if (!latestFile) {
    throw new Error('No alteration files found.');
  }

  return getTimestampFromFileName(latestFile);
};

export const getAlterationFiles = async () => {
  if (!existsSync(alterationFilesDirectorySource)) {
    return [];
  }

  await remove(alterationFilesDirectory);
  await copy(alterationFilesDirectorySource, alterationFilesDirectory);

  const directory = await readdir(alterationFilesDirectory);
  const files = directory.filter((file) => alterationFileNameRegex.test(file));

  return files
    .slice()
    .sort((file1, file2) => getTimestampFromFileName(file1) - getTimestampFromFileName(file2));
};

export const getUndeployedAlterations = async (pool: DatabasePool) => {
  const databaseTimestamp = await getCurrentDatabaseTimestamp(pool);
  const files = await getAlterationFiles();

  return files
    .filter((file) => !databaseTimestamp || getTimestampFromFileName(file) > databaseTimestamp)
    .slice()
    .sort((file1, file2) => getTimestampFromFileName(file1) - getTimestampFromFileName(file2));
};

const importAlteration = async (file: string): Promise<AlterationScript> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const module = await import(path.join(process.cwd(), alterationFilesDirectory, file));

  // eslint-disable-next-line no-restricted-syntax
  return module.default as AlterationScript;
};

const deployAlteration = async (pool: DatabasePool, file: string) => {
  const { up } = await importAlteration(file);

  try {
    await pool.transaction(async (connect) => {
      await up(connect);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`${chalk.red('[alteration]')} run ${file} failed: ${error.message}.`);

      return;
    }

    throw error;
  }

  await updateDatabaseTimestamp(pool, getTimestampFromFileName(file));
  console.log(`${chalk.blue('[alteration]')} run ${file} succeeded.`);
};

export const deployAlterations = async (pool: DatabasePool) => {
  const alterations = await getUndeployedAlterations(pool);

  console.log(
    `${chalk.blue('[alteration]')} found ${alterations.length} alteration${conditionalString(
      alterations.length > 1 && 's'
    )}`
  );

  // The await inside the loop is intended, alterations should run in order
  for (const alteration of alterations) {
    // eslint-disable-next-line no-await-in-loop
    await deployAlteration(pool, alteration);
  }

  console.log(`${chalk.blue('[alteration]')} ✓ done`);
};
