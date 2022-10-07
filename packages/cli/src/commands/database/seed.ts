import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { seeds } from '@logto/schemas';
import chalk from 'chalk';
import { DatabasePool, DatabaseTransactionConnection, sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';
import { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded, insertInto } from '../../database';
import { updateDatabaseTimestamp } from '../../queries/logto-config';
import { buildApplicationSecret, getPathInModule, log, oraPromise } from '../../utilities';
import { getLatestAlterationTimestamp } from './alteration';

const createTables = async (connection: DatabaseTransactionConnection) => {
  const tableDirectory = getPathInModule('@logto/schemas', 'tables');
  const directoryFiles = await readdir(tableDirectory);
  const tableFiles = directoryFiles.filter((file) => file.endsWith('.sql'));
  const queries = await Promise.all(
    tableFiles.map<Promise<[string, string]>>(async (file) => [
      file,
      await readFile(path.join(tableDirectory, file), 'utf8'),
    ])
  );

  // Await in loop is intended for better error handling
  for (const [, query] of queries) {
    // eslint-disable-next-line no-await-in-loop
    await connection.query(sql`${raw(query)}`);
  }
};

const seedTables = async (connection: DatabaseTransactionConnection) => {
  const {
    managementResource,
    defaultSignInExperience,
    createDefaultSetting,
    createDemoAppApplication,
    defaultRole,
  } = seeds;

  await Promise.all([
    connection.query(insertInto(managementResource, 'resources')),
    connection.query(insertInto(createDefaultSetting(), 'settings')),
    connection.query(insertInto(defaultSignInExperience, 'sign_in_experiences')),
    connection.query(
      insertInto(createDemoAppApplication(buildApplicationSecret()), 'applications')
    ),
    connection.query(insertInto(defaultRole, 'roles')),
    updateDatabaseTimestamp(connection, await getLatestAlterationTimestamp()),
  ]);
};

export const seedByPool = async (pool: DatabasePool) => {
  await pool.transaction(async (connection) => {
    await oraPromise(createTables(connection), {
      text: 'Create tables',
      prefixText: chalk.blue('[info]'),
    });
    await oraPromise(seedTables(connection), {
      text: 'Seed data',
      prefixText: chalk.blue('[info]'),
    });
  });
};

const seed: CommandModule = {
  command: 'seed',
  describe: 'Create database and seed tables and data',
  handler: async () => {
    const pool = await createPoolAndDatabaseIfNeeded();

    try {
      await seedByPool(pool);
    } catch (error: unknown) {
      console.error(error);
      console.log();
      log.warn(
        'Error ocurred during seeding your database.\n\n' +
          '  Nothing has changed since the seeding process was in a transaction.\n' +
          '  Try to fix the error and seed again.'
      );
    }
    await pool.end();
  },
};

export default seed;
