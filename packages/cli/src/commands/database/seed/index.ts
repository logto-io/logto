import { getEnv } from '@silverhand/essentials';
import type { DatabasePool } from '@silverhand/slonik';
import type { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded } from '../../../database.js';
import { doesConfigsTableExist } from '../../../queries/logto-config.js';
import { consoleLog, isTty, oraPromise } from '../../../utils.js';
import { getLatestAlterationTimestamp } from '../alteration/index.js';
import { getAlterationDirectory } from '../alteration/utils.js';

import { createTables, seedCloud, seedTables, seedTest } from './tables.js';
import { promptIdFormat } from './utils.js';

export const seedByPool = async (
  pool: DatabasePool,
  cloud = false,
  test = false,
  encryptBaseRole = false
) => {
  await pool.transaction(async (connection) => {
    // Check alteration scripts available in order to insert correct timestamp
    const latestTimestamp = await getLatestAlterationTimestamp();

    if (latestTimestamp < 1) {
      throw new Error(
        `No alteration script found when seeding the database.\n` +
          `Please check \`${getAlterationDirectory()}\` to see if there are alteration scripts available.\n`
      );
    }

    const tableInfo = await oraPromise(createTables(connection, encryptBaseRole), {
      text: 'Create tables',
    });

    if (tableInfo.password.length > 0) {
      consoleLog.info('base role password:', tableInfo.password);
    }

    await seedTables(connection, latestTimestamp, cloud);

    if (cloud) {
      await seedCloud(connection);
    }

    if (test) {
      await seedTest(connection);
    }
  });
};

const seedLegacyTestData = async (pool: DatabasePool) => {
  return pool.transaction(async (connection) => {
    await seedTest(connection, true);
  });
};

/**
 * Resolve the ID format and set it in `process.env.ID_FORMAT` so all seed
 * functions can read it via `getIdFormat()` from `@logto/shared`.
 *
 * Priority: CLI option > ENV variable > interactive prompt > default ('nanoid')
 */
const resolveIdFormat = async (cliIdFormat?: string): Promise<void> => {
  // CLI option takes highest priority
  if (cliIdFormat) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    process.env.ID_FORMAT = cliIdFormat;
    return;
  }

  // Check ENV variable (already set in process.env)
  const envFormat = getEnv('ID_FORMAT');
  if (envFormat) {
    if (envFormat !== 'nanoid' && envFormat !== 'uuid') {
      throw new Error(
        `Invalid ID_FORMAT environment variable: '${envFormat}'. Must be 'nanoid' or 'uuid'.`
      );
    }
    return;
  }

  // Interactive prompt in TTY mode
  if (isTty()) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    process.env.ID_FORMAT = await promptIdFormat();
    return;
  }

  // Default: nanoid (getIdFormat() returns 'nanoid' when ID_FORMAT is unset)
};

const seed: CommandModule<
  Record<string, unknown>,
  {
    swe?: boolean;
    cloud?: boolean;
    test?: boolean;
    'legacy-test-data'?: boolean;
    'encrypt-base-role'?: boolean;
    'id-format'?: string;
  }
> = {
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
      })
      .option('test', {
        describe: 'Seed additional test data',
        type: 'boolean',
      })
      .option('legacy-test-data', {
        describe:
          'Seed test data only for legacy Logto versions (<=1.12.0), this option conflicts with others',
        type: 'boolean',
      })
      .option('encrypt-base-role', {
        describe: 'Seed base role with password',
        type: 'boolean',
      })
      .option('id-format', {
        describe:
          'ID format for all entity types (nanoid or uuid). This choice is permanent and cannot be changed after installation. Defaults to ID_FORMAT env variable or nanoid.',
        type: 'string',
        choices: ['nanoid', 'uuid'] as const,
      }),
  handler: async ({ swe, cloud, test, legacyTestData, encryptBaseRole, idFormat }) => {
    const pool = await createPoolAndDatabaseIfNeeded();

    if (legacyTestData) {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (swe || cloud || test) {
        throw new Error(
          'The `legacy-test-data` option conflicts with other options, please use it alone.'
        );
      }

      await seedLegacyTestData(pool);
      await pool.end();
      return;
    }

    if (swe && (await doesConfigsTableExist(pool))) {
      consoleLog.info('Seeding skipped');
      await pool.end();

      return;
    }

    try {
      await resolveIdFormat(idFormat);

      await seedByPool(pool, cloud, test, encryptBaseRole);
    } catch (error: unknown) {
      consoleLog.error(error);
      consoleLog.error(
        'Error ocurred during seeding your database.\n\n' +
          '  Nothing has changed since the seeding process was in a transaction.\n' +
          '  Try to fix the error and seed again.'
      );
      throw error;
    } finally {
      await pool.end();
    }
  },
};

export default seed;
