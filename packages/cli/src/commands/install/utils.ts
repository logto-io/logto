import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { assert } from '@silverhand/essentials';
import chalk from 'chalk';
import { got, RequestError } from 'got';
import inquirer from 'inquirer';
import * as semver from 'semver';
import { extract } from 'tar';
import { z } from 'zod';

import { defaultPath } from '../../constants.js';
import { createPoolAndDatabaseIfNeeded } from '../../database.js';
import { packageJson } from '../../package-json.js';
import {
  cliConfig,
  ConfigKey,
  consoleLog,
  downloadFile,
  isTty,
  oraPromise,
  safeExecSync,
} from '../../utils.js';
import { seedByPool } from '../database/seed/index.js';

const pgRequired = new semver.SemVer('14.0.0');

const serverPackageJsonGuard = z.object({
  engines: z.object({ node: z.string() }).optional(),
});

type NodeVersionCheck = {
  fatalError?: string;
  warning?: string;
};

export const checkNodeVersion = (
  requiredVersionString: string,
  currentVersion: string,
  subject = 'Logto'
): NodeVersionCheck => {
  const required = semver.validRange(requiredVersionString)
    ? semver.minVersion(requiredVersionString)
    : null;
  const current = new semver.SemVer(currentVersion);

  // An unparsable range carries no requirement to validate, matching how a missing or invalid
  // release manifest is handled.
  if (!required) {
    return {};
  }

  // Exit if the major version is lower than the required version since there may be changes that
  // break the compatibility.
  if (required.major > current.major) {
    return {
      fatalError: `${subject} requires NodeJS ${requiredVersionString}, but ${current.version} found.`,
    };
  }

  // Only warn for incompatible minor/patch versions or higher major versions.
  if (!semver.satisfies(current.version, requiredVersionString)) {
    return {
      warning: `${subject} is tested under NodeJS ${requiredVersionString}, but version ${current.version} found.`,
    };
  }

  return {};
};

const getCurrentNodeVersion = () => execSync('node -v', { encoding: 'utf8', stdio: 'pipe' });

export const validateNodeVersion = (requiredVersionString = packageJson.engines.node) => {
  const { fatalError, warning } = checkNodeVersion(requiredVersionString, getCurrentNodeVersion());

  if (fatalError) {
    consoleLog.fatal(fatalError);
  }

  if (warning) {
    consoleLog.warn(warning);
  }
};

const readServerNodeRequirement = async (installPath: string) => {
  try {
    const { engines } = serverPackageJsonGuard.parse(
      JSON.parse(await fs.readFile(path.join(installPath, 'package.json'), 'utf8'))
    );

    return engines?.node;
  } catch {
    // A custom `--download-url` tarball may not follow the release layout. Without a readable
    // manifest there is no requirement to validate, so continue the installation as before.
  }
};

export const validateServerNodeVersion = async (installPath: string) => {
  const requiredVersionString = await readServerNodeRequirement(installPath);

  if (!requiredVersionString) {
    return;
  }

  const { fatalError, warning } = checkNodeVersion(
    requiredVersionString,
    getCurrentNodeVersion(),
    'The downloaded Logto release'
  );

  if (fatalError) {
    // The release cannot run on the current Node.js version; remove the partial installation so
    // the path can be reused.
    await oraPromise(fs.rm(installPath, { force: true, recursive: true }), {
      text: 'Clean up',
    });
    consoleLog.fatal(fatalError);
  }

  if (warning) {
    consoleLog.warn(warning);
  }
};

const validatePath = (value: string) =>
  existsSync(path.resolve(value))
    ? `The path ${chalk.green(value)} already exists, please try another.`
    : true;

export const inquireInstallPath = async (initialPath?: string) => {
  if (!isTty()) {
    assert(initialPath, new Error('Path is missing'));

    return initialPath;
  }

  const { instancePath } = await inquirer.prompt<{ instancePath: string }>(
    {
      name: 'instancePath',
      message: 'Where should we create your Logto instance?',
      type: 'input',
      default: defaultPath,
      filter: (value: string) => value.trim(),
      validate: validatePath,
    },
    { instancePath: initialPath }
  );

  // Validate for initialPath
  const validated = validatePath(instancePath);

  if (validated !== true) {
    consoleLog.fatal(validated);
  }

  return instancePath;
};

export const validateDatabase = async () => {
  if (cliConfig.has(ConfigKey.DatabaseUrl) || !isTty()) {
    return;
  }

  const { hasPostgresUrl } = await inquirer.prompt<{ hasPostgresUrl?: boolean }>({
    name: 'hasPostgresUrl',
    message: `Logto requires PostgreSQL >=${pgRequired.version} but cannot find in the current environment.\n  Do you have a remote PostgreSQL instance ready?`,
    type: 'confirm',
    when: () => {
      const pgOutput = safeExecSync('postgres --version') ?? '';
      // Filter out all brackets in the output since Homebrew will append `(Homebrew)`.
      const pgArray = pgOutput.split(' ').filter((value) => !value.startsWith('('));
      const pgCurrent = semver.coerce(pgArray.at(-1));

      return !pgCurrent || pgCurrent.compare(pgRequired) < 0;
    },
  });

  if (hasPostgresUrl === false) {
    consoleLog.fatal('Logto requires a Postgres instance to run.');
  }
};

const fetchDownloadUrl = async (url?: string) => {
  if (url) {
    return url;
  }

  const defaultUrl = `https://github.com/logto-io/logto/releases/download/v${packageJson.version}/logto.tar.gz`;

  try {
    await got.head(defaultUrl);
  } catch (error) {
    if (error instanceof RequestError && error.response?.statusCode === 404) {
      consoleLog.warn(
        `Current version "v${packageJson.version}" not found in GitHub Releases, fallback to "latest".\n` +
          'If you want to download the latest version, please wait a few moments and try again.'
      );
      return 'https://github.com/logto-io/logto/releases/latest/download/logto.tar.gz';
    }
  }

  return defaultUrl;
};

export const downloadRelease = async (url?: string) => {
  const tarFilePath = path.resolve(os.tmpdir(), './logto.tar.gz');
  const from = await fetchDownloadUrl(url);

  consoleLog.info(`Download Logto from ${from}`);
  consoleLog.info(`Target ${tarFilePath}`);
  await downloadFile(from, tarFilePath);

  return tarFilePath;
};

export const decompress = async (toPath: string, tarPath: string) => {
  const run = async () => {
    try {
      await fs.mkdir(toPath);
      await extract({ file: tarPath, cwd: toPath, strip: 1 });
    } catch (error: unknown) {
      consoleLog.fatal(error);
    }
  };

  return oraPromise(
    run(),
    {
      text: `Decompress to ${toPath}`,
    },
    true
  );
};

type SeedDatabaseOptions = {
  cloud: boolean;
  disablePwnedPasswordCheck?: boolean;
};

export const seedDatabase = async (
  instancePath: string,
  { cloud, disablePwnedPasswordCheck }: SeedDatabaseOptions
) => {
  try {
    const pool = await createPoolAndDatabaseIfNeeded();
    await seedByPool(pool, { cloud, disablePwnedPasswordCheck });
    await pool.end();
  } catch (error: unknown) {
    consoleLog.error(error);

    await oraPromise(fs.rm(instancePath, { force: true, recursive: true }), {
      text: 'Clean up',
    });

    consoleLog.fatal(
      'Error occurred during seeding your Logto database. Nothing has changed since the seeding process was in a transaction.\n\n' +
        `  To skip the database seeding, append ${chalk.green(
          '--skip-seed'
        )} to the command options.`
    );
  }
};

export const createEnv = async (installPath: string, databaseUrl: string) => {
  const dotEnvPath = path.resolve(installPath, '.env');
  await fs.writeFile(dotEnvPath, `DB_URL=${databaseUrl}`, 'utf8');
  consoleLog.info(`Saved database URL to ${chalk.blue(dotEnvPath)}`);
};

export const logFinale = (installPath: string) => {
  const startCommand = `cd ${installPath} && npm start`;
  consoleLog.info(
    `Use the command below to start Logto. Happy hacking!\n\n  ${chalk.green(startCommand)}`
  );
};

export const isUrl = (string: string) => {
  try {
    // On purpose to test
    // eslint-disable-next-line no-new
    new URL(string);

    return true;
  } catch {
    return false;
  }
};
