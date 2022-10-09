import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { LogtoConfigKey, LogtoOidcConfig, logtoOidcConfigGuard, seeds } from '@logto/schemas';
import chalk from 'chalk';
import { DatabasePool, DatabaseTransactionConnection, sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';
import { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded, insertInto } from '../../../database';
import {
  getRowsByKeys,
  updateDatabaseTimestamp,
  updateValueByKey,
} from '../../../queries/logto-config';
import { buildApplicationSecret, getPathInModule, log, oraPromise } from '../../../utilities';
import { getLatestAlterationTimestamp } from '../alteration';
import { OidcConfigKey, oidcConfigReaders } from './oidc-config';

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

const seedOidcConfigs = async (pool: DatabaseTransactionConnection) => {
  const { rows } = await getRowsByKeys(pool, [LogtoConfigKey.OidcConfig]);
  const existingConfig = await logtoOidcConfigGuard
    .parseAsync(rows[0]?.value)
    // It's useful!
    // eslint-disable-next-line unicorn/no-useless-undefined
    .catch(() => undefined);
  const existingKeys = existingConfig ? Object.keys(existingConfig) : [];
  const validOptions = OidcConfigKey.options.filter((key) => {
    const included = existingKeys.includes(key);

    if (included) {
      log.info(`Key ${chalk.green(key)} exists, skipping`);
    }

    return !included;
  });

  const entries: Array<[keyof LogtoOidcConfig, LogtoOidcConfig[keyof LogtoOidcConfig]]> = [];

  // Both await in loop and `.push()` are intended since we'd like to log info in sequence
  for (const key of validOptions) {
    // eslint-disable-next-line no-await-in-loop
    const { value, fromEnv } = await oidcConfigReaders[key]();

    if (fromEnv) {
      log.info(`Read config ${chalk.green(key)} from env`);
    } else {
      log.info(`Generated config ${chalk.green(key)}`);
    }

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    entries.push([key, value]);
  }

  await updateValueByKey(pool, LogtoConfigKey.OidcConfig, {
    ...existingConfig,
    ...Object.fromEntries(entries),
  });
  log.succeed('Seed OIDC config');
};

const seedChoices = Object.freeze(['all', 'oidc'] as const);

type SeedChoice = typeof seedChoices[number];

export const seedByPool = async (pool: DatabasePool, type: SeedChoice) => {
  await pool.transaction(async (connection) => {
    if (type !== 'oidc') {
      await oraPromise(createTables(connection), {
        text: 'Create tables',
        prefixText: chalk.blue('[info]'),
      });
      await oraPromise(seedTables(connection), {
        text: 'Seed data',
        prefixText: chalk.blue('[info]'),
      });
    }

    await seedOidcConfigs(connection);
  });
};

const seed: CommandModule<Record<string, unknown>, { type: string }> = {
  command: 'seed [type]',
  describe: 'Create database then seed tables and data',
  builder: (yargs) =>
    yargs.positional('type', {
      describe: 'Optional seed type',
      type: 'string',
      choices: seedChoices,
      default: 'all',
    }),
  handler: async ({ type }) => {
    const pool = await createPoolAndDatabaseIfNeeded();

    try {
      // Cannot avoid `as` since the official type definition of `yargs` doesn't work.
      // The value of `type` can be ensured, so it's safe to use `as` here.
      // eslint-disable-next-line no-restricted-syntax
      await seedByPool(pool, type as SeedChoice);
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
