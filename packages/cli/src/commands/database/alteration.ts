import path from 'path';

import { AlterationScript } from '@logto/schemas/lib/types/alteration';
import { findPackage } from '@logto/shared';
import { conditional, conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import { copy, existsSync, remove, readdir } from 'fs-extra';
import inquirer from 'inquirer';
import { SemVer, compare, eq, gt } from 'semver';
import { DatabasePool } from 'slonik';
import { CommandModule } from 'yargs';

import { createPoolFromConfig } from '../../database';
import {
  getCurrentDatabaseAlterationTimestamp,
  updateDatabaseTimestamp,
} from '../../queries/logto-config';
import { getPathInModule, log } from '../../utilities';

const alterationFilenameRegex = /-(\d+)-?.*\.js$/;

const getTimestampFromFilename = (filename: string) => {
  const match = alterationFilenameRegex.exec(filename);

  if (!match?.[1]) {
    throw new Error(`Can not get timestamp: ${filename}`);
  }

  return Number(match[1]);
};

const getVersionFromFilename = (filename: string) => {
  try {
    return new SemVer(filename.split('-')[0]?.replaceAll('_', '-') ?? 'unknown');
  } catch {}
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

  /**
   * We copy all alteration scripts to the CLI package root directory,
   * since they need a proper context that includes required dependencies (such as slonik) in `node_modules/`.
   * While the original `@logto/schemas` may remove them in production.
   */
  const packageDirectory = await findPackage(
    // Until we migrate to ESM
    // eslint-disable-next-line unicorn/prefer-module
    __dirname
  );

  const localAlterationDirectory = path.resolve(
    // Until we migrate to ESM
    // eslint-disable-next-line unicorn/prefer-module
    packageDirectory ?? __dirname,
    'alteration-scripts'
  );

  if (!existsSync(alterationDirectory)) {
    return [];
  }

  // We need to copy alteration files to execute in the CLI context to make `slonik` available
  await remove(localAlterationDirectory);
  await copy(alterationDirectory, localAlterationDirectory);

  const directory = await readdir(localAlterationDirectory);
  const files = directory.filter((file) => alterationFilenameRegex.test(file));

  return files
    .slice()
    .sort((file1, file2) => getTimestampFromFilename(file1) - getTimestampFromFilename(file2))
    .map((filename) => ({ path: path.join(localAlterationDirectory, filename), filename }));
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

const latestTag = 'latest';

export const chooseAlterationsByVersion = async (
  alterations: readonly AlterationFile[],
  initialVersion?: string
) => {
  const versions = alterations
    .map(({ filename }) => getVersionFromFilename(filename))
    .filter((version): version is SemVer => version instanceof SemVer)
    // Cannot use `Set` to deduplicate since it's a class
    .filter((version, index, self) => index === self.findIndex((another) => eq(version, another)))
    .slice()
    .sort((i, j) => compare(j, i));

  if (!versions[0]) {
    log.error('No alteration script to deploy');
  }

  const { version: targetVersion } =
    initialVersion === latestTag
      ? { version: versions[0] }
      : await inquirer.prompt<{ version: SemVer }>(
          {
            type: 'list',
            message: 'Choose the alteration target version',
            name: 'version',
            choices: versions.map((semVersion) => ({
              name: semVersion.version,
              value: semVersion,
            })),
          },
          {
            version: conditional(initialVersion && new SemVer(initialVersion)),
          }
        );

  log.info(`Deploy target ${chalk.green(targetVersion.version)}`);

  return alterations.filter(({ filename }) => {
    const version = getVersionFromFilename(filename);

    return version && !gt(version, targetVersion);
  });
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
