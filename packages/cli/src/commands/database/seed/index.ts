import chalk from 'chalk';
import type { DatabasePool } from 'slonik';
import type { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded } from '../../../database.js';
import { doesConfigsTableExist } from '../../../queries/logto-config.js';
import { log, oraPromise } from '../../../utilities.js';
import { getLatestAlterationTimestamp } from '../alteration/index.js';
import { getAlterationDirectory } from '../alteration/utils.js';
import { createTables, seedTables } from './tables.js';

const seedChoices = Object.freeze(['all', 'oidc'] as const);

type SeedChoice = typeof seedChoices[number];

export const seedByPool = async (pool: DatabasePool, type: SeedChoice) => {
  await pool.transaction(async (connection) => {
    if (type !== 'oidc') {
      // Check alteration scripts available in order to insert correct timestamp
      const latestTimestamp = await getLatestAlterationTimestamp();

      if (latestTimestamp < 1) {
        throw new Error(
          `No alteration script found when seeding the database.\n` +
            `Please check \`${getAlterationDirectory()}\` to see if there are alteration scripts available.\n`
        );
      }

      await oraPromise(createTables(connection), {
        text: 'Create tables',
        prefixText: chalk.blue('[info]'),
      });
      await oraPromise(seedTables(connection, latestTimestamp), {
        text: 'Seed data',
        prefixText: chalk.blue('[info]'),
      });
    }
  });
};

const seed: CommandModule<Record<string, unknown>, { type: string; swe?: boolean }> = {
  command: 'seed [type]',
  describe: 'Create database then seed tables and data',
  builder: (yargs) =>
    yargs
      .option('swe', {
        describe: 'Skip the seeding process when Logto configs table exists',
        alias: 'skip-when-exists',
        type: 'boolean',
      })
      .positional('type', {
        describe: 'Optional seed type',
        type: 'string',
        choices: seedChoices,
        default: 'all',
      }),
  handler: async ({ type, swe }) => {
    const pool = await createPoolAndDatabaseIfNeeded();

    if (swe && (await doesConfigsTableExist(pool))) {
      log.info('Seeding skipped');
      await pool.end();

      return;
    }

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
