import path from 'path';

import { AlterationScript } from '@logto/schemas/lib/types/alteration';
import { conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import { copy, existsSync, remove, readdir } from 'fs-extra';
import { DatabasePool } from 'slonik';
import { CommandModule } from 'yargs';

import { createPoolFromEnv } from '../../database';
import {
  getCurrentDatabaseAlterationTimestamp,
  updateDatabaseTimestamp,
} from '../../queries/logto-config';
import { getPathInModule, log } from '../../utilities';

const alterationFileNameRegex = /-(\d+)-?.*\.js$/;

const getTimestampFromFileName = (fileName: string) => {
  const match = alterationFileNameRegex.exec(fileName);

  if (!match?.[1]) {
    throw new Error(`Can not get timestamp: ${fileName}`);
  }

  return Number(match[1]);
};

const importAlterationScript = async (filePath: string): Promise<AlterationScript> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const module = await import(filePath);

  // eslint-disable-next-line no-restricted-syntax
  return module.default as AlterationScript;
};

type AlterationFile = { path: string; filename: string };

export const getAlterationFiles = async (): Promise<AlterationFile[]> => {
  const alterationDirectory = getPathInModule('@logto/schemas', 'alterations');
  // Until we migrate to ESM
  // eslint-disable-next-line unicorn/prefer-module
  const localAlterationDirectory = path.resolve(__dirname, './alteration-scripts');

  if (!existsSync(alterationDirectory)) {
    return [];
  }

  // We need to copy alteration files to execute in the CLI context to make `slonik` available
  await remove(localAlterationDirectory);
  await copy(alterationDirectory, localAlterationDirectory);

  const directory = await readdir(localAlterationDirectory);
  const files = directory.filter((file) => alterationFileNameRegex.test(file));

  return files
    .slice()
    .sort((file1, file2) => getTimestampFromFileName(file1) - getTimestampFromFileName(file2))
    .map((filename) => ({ path: path.join(localAlterationDirectory, filename), filename }));
};

export const getLatestAlterationTimestamp = async () => {
  const files = await getAlterationFiles();
  const lastFile = files[files.length - 1];

  if (!lastFile) {
    return 0;
  }

  return getTimestampFromFileName(lastFile.filename);
};

export const getUndeployedAlterations = async (pool: DatabasePool) => {
  const databaseTimestamp = await getCurrentDatabaseAlterationTimestamp(pool);
  const files = await getAlterationFiles();

  return files.filter(({ filename }) => getTimestampFromFileName(filename) > databaseTimestamp);
};

const deployAlteration = async (
  pool: DatabasePool,
  { path: filePath, filename }: AlterationFile
) => {
  const { up } = await importAlterationScript(filePath);

  try {
    await pool.transaction(async (connection) => {
      await up(connection);
      await updateDatabaseTimestamp(connection, getTimestampFromFileName(filename));
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

const alteration: CommandModule<unknown, { action: string }> = {
  command: ['alteration <action>', 'alt', 'alter'],
  describe: 'Perform database alteration',
  builder: (yargs) =>
    yargs.positional('action', {
      describe: 'The action to perform, now it only accepts `deploy`',
      type: 'string',
      demandOption: true,
    }),
  handler: async ({ action }) => {
    if (action !== 'deploy') {
      log.error('Unsupported action');
    }

    const pool = await createPoolFromEnv();
    const alterations = await getUndeployedAlterations(pool);

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
