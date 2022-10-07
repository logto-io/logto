import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { seeds } from '@logto/schemas';
import chalk from 'chalk';
import ora from 'ora';
import { DatabasePool, DatabaseTransactionConnection, sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';
import { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded, insertInto } from '../../database';
import { updateDatabaseTimestamp } from '../../queries/logto-config';
import { buildApplicationSecret, getPathInModule, log } from '../../utilities';
import { getLatestAlterationTimestamp } from './alteration';

const createTables = async (connection: DatabaseTransactionConnection) => {
  const spinner = ora({
    text: 'Create tables',
    prefixText: chalk.blue('[info]'),
  }).start();
  const tableDirectory = getPathInModule('@logto/schemas', 'tables');
  const directoryFiles = await readdir(tableDirectory);
  const tableFiles = directoryFiles.filter((file) => file.endsWith('.sql'));
  const queries = await Promise.all(
    tableFiles.map<Promise<[string, string]>>(async (file) => [
      file,
      await readFile(path.join(tableDirectory, file), 'utf8'),
    ])
  );

  // Disable for spinner
  /* eslint-disable @silverhand/fp/no-mutation */
  // Await in loop is intended for better error handling
  for (const [file, query] of queries) {
    // eslint-disable-next-line no-await-in-loop
    await connection.query(sql`${raw(query)}`);
    spinner.text = `Run ${file} succeeded`;
  }

  spinner.succeed(`Created ${queries.length} tables`);
  /* eslint-enable @silverhand/fp/no-mutation */
};

const seedTables = async (connection: DatabaseTransactionConnection) => {
  const {
    managementResource,
    defaultSignInExperience,
    createDefaultSetting,
    createDemoAppApplication,
    defaultRole,
  } = seeds;

  const spinner = ora({
    text: 'Seed data',
    prefixText: chalk.blue('[info]'),
  }).start();

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

  spinner.succeed();
};

export const seedByPool = async (pool: DatabasePool) => {
  await pool.transaction(async (connection) => {
    await createTables(connection);
    await seedTables(connection);
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
