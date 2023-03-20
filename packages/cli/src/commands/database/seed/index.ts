import chalk from 'chalk';
import type { DatabasePool } from 'slonik';
import type { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded } from '../../../database.js';
import { doesConfigsTableExist } from '../../../queries/logto-config.js';
import { log, oraPromise } from '../../../utils.js';
import { getLatestAlterationTimestamp } from '../alteration/index.js';
import { getAlterationDirectory } from '../alteration/utils.js';
import { createTables, seedCloud, seedTables } from './tables.js';

export const seedByPool = async (pool: DatabasePool, cloud = false) => {
  await pool.transaction(async (connection) => {
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
    await seedTables(connection, latestTimestamp, cloud);

    if (cloud) {
      await seedCloud(connection);
    }
  });
};

const seed: CommandModule<Record<string, unknown>, { swe?: boolean; cloud?: boolean }> = {
  command: 'seed [type]',
  describe: 'Create database then seed tables and data',
  builder: (yargs) =>
    yargs
      .option('swe', {
        describe: 'Skip the seeding process when Logto configs table exists',
        alias: 'skip-when-exists',
        type: 'boolean',
      })
      .option('cloud', {
        describe: 'Seed additional cloud data',
        type: 'boolean',
        hidden: true,
      }),
  handler: async ({ swe, cloud }) => {
    const pool = await createPoolAndDatabaseIfNeeded();

    if (swe && (await doesConfigsTableExist(pool))) {
      log.info('Seeding skipped');
      await pool.end();

      return;
    }

    try {
      await seedByPool(pool, cloud);
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
