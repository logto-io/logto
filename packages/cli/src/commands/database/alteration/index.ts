import type { AlterationScript } from '@logto/schemas/lib/types/alteration.js';
import { conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import type { DatabasePool } from 'slonik';
import type { CommandModule } from 'yargs';

import { createPoolFromConfig } from '../../../database.js';
import {
  getCurrentDatabaseAlterationTimestamp,
  updateDatabaseTimestamp,
} from '../../../queries/logto-config.js';
import { log } from '../../../utilities.js';
import type { AlterationFile } from './type.js';
import { getAlterationFiles, getTimestampFromFilename } from './utils.js';
import { chooseAlterationsByVersion, chooseRevertAlterationsByVersion } from './version.js';

const importAlterationScript = async (filePath: string): Promise<AlterationScript> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const module = await import(filePath);

  // eslint-disable-next-line no-restricted-syntax
  return module.default as AlterationScript;
};

export const getLatestAlterationTimestamp = async () => {
  const files = await getAlterationFiles();
  const lastFile = files[files.length - 1];

  if (!lastFile) {
    return 0;
  }

  return getTimestampFromFilename(lastFile.filename);
};

export const getAvailableAlterations = async (
  pool: DatabasePool,
  compareMode: 'gt' | 'lte' = 'gt'
) => {
  const databaseTimestamp = await getCurrentDatabaseAlterationTimestamp(pool);

  const files = await getAlterationFiles();

  return files.filter(({ filename }) =>
    compareMode === 'gt'
      ? getTimestampFromFilename(filename) > databaseTimestamp
      : getTimestampFromFilename(filename) <= databaseTimestamp
  );
};

const deployAlteration = async (
  pool: DatabasePool,
  { path: filePath, filename }: AlterationFile,
  action: 'up' | 'down' = 'up'
) => {
  const { up, down } = await importAlterationScript(filePath);

  try {
    await pool.transaction(async (connection) => {
      if (action === 'up') {
        await up(connection);
        await updateDatabaseTimestamp(connection, getTimestampFromFilename(filename));
      }

      if (action === 'down') {
        await down(connection);

        const newTimestamp = getTimestampFromFilename(filename) - 1;

        if (newTimestamp > 0) {
          await updateDatabaseTimestamp(connection, newTimestamp);
        }
      }
    });
  } catch (error: unknown) {
    console.error(error);

    await pool.end();
    log.error(
      `Error ocurred during running alteration ${chalk.blue(filename)}.\n\n` +
        "  This alteration didn't change anything since it was in a transaction.\n" +
        '  Try to fix the error and deploy again.'
    );
  }

  log.info(`Run alteration ${filename} \`${action}()\` function succeeded`);
};

const alteration: CommandModule<unknown, { action: string; target?: string }> = {
  command: ['alteration <action> [target]', 'alt', 'alter'],
  describe: 'Perform database alteration',
  builder: (yargs) =>
    yargs
      .positional('action', {
        describe: 'The action to perform, accepts `list`, `deploy`, and `rollback` (or `r`).',
        type: 'string',
        demandOption: true,
      })
      .positional('target', {
        describe: 'The target Logto version for alteration',
        type: 'string',
      }),
  handler: async ({ action, target }) => {
    if (action === 'list') {
      const files = await getAlterationFiles();

      for (const file of files) {
        console.log(file.filename);
      }
    } else if (action === 'deploy') {
      const pool = await createPoolFromConfig();
      const alterations = await chooseAlterationsByVersion(
        await getAvailableAlterations(pool),
        target
      );

      log.info(
        `Found ${alterations.length} alteration${conditionalString(
          alterations.length > 1 && 's'
        )} to deploy`
      );

      // The await inside the loop is intended, alterations should run in order
      for (const alteration of alterations) {
        // eslint-disable-next-line no-await-in-loop
        await deployAlteration(pool, alteration);
      }

      await pool.end();
    } else if (['rollback', 'r'].includes(action)) {
      const pool = await createPoolFromConfig();
      const alterations = await chooseRevertAlterationsByVersion(
        await getAvailableAlterations(pool, 'lte'),
        target ?? ''
      );

      log.info(
        `Found ${alterations.length} alteration${conditionalString(
          alterations.length > 1 && 's'
        )} to revert`
      );

      // The await inside the loop is intended, alterations should run in order
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      for (const alteration of alterations.slice().reverse()) {
        // eslint-disable-next-line no-await-in-loop
        await deployAlteration(pool, alteration, 'down');
      }

      await pool.end();
    } else {
      log.error('Unsupported action');
    }
  },
};

export default alteration;
