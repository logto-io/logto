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
import { chooseAlterationsByVersion } from './version.js';

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

export const getUndeployedAlterations = async (pool: DatabasePool) => {
  const databaseTimestamp = await getCurrentDatabaseAlterationTimestamp(pool);

  const files = await getAlterationFiles();

  return files.filter(({ filename }) => getTimestampFromFilename(filename) > databaseTimestamp);
};

const deployAlteration = async (
  pool: DatabasePool,
  { path: filePath, filename }: AlterationFile
) => {
  const { up } = await importAlterationScript(filePath);

  try {
    await pool.transaction(async (connection) => {
      await up(connection);
      await updateDatabaseTimestamp(connection, getTimestampFromFilename(filename));
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

  log.info(`Run alteration ${filename} succeeded`);
};

const alteration: CommandModule<unknown, { action: string; target?: string }> = {
  command: ['alteration <action> [target]', 'alt', 'alter'],
  describe: 'Perform database alteration',
  builder: (yargs) =>
    yargs
      .positional('action', {
        describe: 'The action to perform, now it only accepts `deploy`',
        type: 'string',
        demandOption: true,
      })
      .positional('target', {
        describe: 'The target Logto version for alteration',
        type: 'string',
      }),
  handler: async ({ action, target }) => {
    if (action !== 'deploy') {
      log.error('Unsupported action');
    }

    const pool = await createPoolFromConfig();
    const alterations = await chooseAlterationsByVersion(
      await getUndeployedAlterations(pool),
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
  },
};

export default alteration;
