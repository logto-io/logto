import type { DatabasePool } from '@silverhand/slonik';
import type { CommandModule } from 'yargs';

import { createPoolAndDatabaseIfNeeded } from '../../../database.js';
import { doesConfigsTableExist } from '../../../queries/logto-config.js';
import { consoleLog, oraPromise } from '../../../utils.js';
import { getLatestAlterationTimestamp } from '../alteration/index.js';
import { getAlterationDirectory } from '../alteration/utils.js';

import { createTables, seedCloud, seedTables, seedTest } from './tables.js';

export const seedByPool = async (
  pool: DatabasePool,
  cloud = false,
  test = false,
  encryptBaseRole = false,
  disablePwnedPasswordCheck = false
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

    await seedTables(connection, latestTimestamp, cloud, { disablePwnedPasswordCheck });

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

const seed: CommandModule<
  Record<string, unknown>,
  {
    swe?: boolean;
    cloud?: boolean;
    test?: boolean;
    'legacy-test-data'?: boolean;
    'encrypt-base-role'?: boolean;
    dapc?: boolean;
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
      .option('dapc', {
        describe:
          "Seed the admin tenant's sign-in experience with the HaveIBeenPwned (HIBP) " +
          'password breach check disabled. Use this for air-gapped or offline OSS deployments ' +
          'where api.pwnedpasswords.com is unreachable, otherwise creating the first admin ' +
          'user from the Welcome page will hang on the breach check. Scope: admin tenant only ' +
          "— the default tenant's password policy is unaffected and stays admin-controlled " +
          'via the Admin Console.',
        alias: 'disable-admin-pwned-password-check',
        type: 'boolean',
      }),
  handler: async ({ swe, cloud, test, legacyTestData, encryptBaseRole, dapc }) => {
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
      await seedByPool(pool, cloud, test, encryptBaseRole, dapc);
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
