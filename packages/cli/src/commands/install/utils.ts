import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import os from 'os';
import path from 'path';

import { assert } from '@silverhand/essentials';
import chalk from 'chalk';
import { remove, writeFile } from 'fs-extra';
import inquirer from 'inquirer';
import * as semver from 'semver';
import tar from 'tar';

import { createPoolAndDatabaseIfNeeded } from '../../database.js';
import {
  cliConfig,
  ConfigKey,
  downloadFile,
  isTty,
  log,
  oraPromise,
  safeExecSync,
} from '../../utilities.js';
import { seedByPool } from '../database/seed/index.js';

export const defaultPath = path.join(os.homedir(), 'logto');
const pgRequired = new semver.SemVer('14.0.0');

export const validateNodeVersion = () => {
  const required = [new semver.SemVer('16.13.0'), new semver.SemVer('18.12.0')];
  const requiredVersionString = required.map((version) => '^' + version.version).join(' || ');
  const current = new semver.SemVer(execSync('node -v', { encoding: 'utf8', stdio: 'pipe' }));

  if (required.every((version) => version.major !== current.major)) {
    log.error(`Logto requires NodeJS ${requiredVersionString}, but ${current.version} found.`);
  }

  if (required.some((version) => version.major === current.major && version.compare(current) > 0)) {
    log.warn(
      `Logto is tested under NodeJS ${requiredVersionString}, but version ${current.version} found.`
    );
  }
};

const validatePath = (value: string) =>
  existsSync(path.resolve(value))
    ? `The path ${chalk.green(value)} already exists, please try another.`
    : true;

export const inquireInstancePath = async (initialPath?: string) => {
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
    log.error(validated);
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
      const pgCurrent = semver.coerce(pgArray[pgArray.length - 1]);

      return !pgCurrent || pgCurrent.compare(pgRequired) < 0;
    },
  });

  if (hasPostgresUrl === false) {
    log.error('Logto requires a Postgres instance to run.');
  }
};

export const downloadRelease = async (url?: string) => {
  const tarFilePath = path.resolve(os.tmpdir(), './logto.tar.gz');

  log.info(`Download Logto to ${tarFilePath}`);
  await downloadFile(
    url ?? 'https://github.com/logto-io/logto/releases/latest/download/logto.tar.gz',
    tarFilePath
  );

  return tarFilePath;
};

export const decompress = async (toPath: string, tarPath: string) => {
  const run = async () => {
    try {
      await mkdir(toPath);
      await tar.extract({ file: tarPath, cwd: toPath, strip: 1 });
    } catch (error: unknown) {
      log.error(error);
    }
  };

  return oraPromise(
    run(),
    {
      text: `Decompress to ${toPath}`,
      prefixText: chalk.blue('[info]'),
    },
    true
  );
};

export const seedDatabase = async (instancePath: string) => {
  try {
    const pool = await createPoolAndDatabaseIfNeeded();
    await seedByPool(pool, 'all');
    await pool.end();
  } catch (error: unknown) {
    console.error(error);

    await oraPromise(remove(instancePath), {
      text: 'Clean up',
      prefixText: chalk.blue('[info]'),
    });

    log.error(
      'Error occurred during seeding your Logto database. Nothing has changed since the seeding process was in a transaction.\n\n' +
        `  To skip the database seeding, append ${chalk.green(
          '--skip-seed'
        )} to the command options.`
    );
  }
};

export const createEnv = async (instancePath: string, databaseUrl: string) => {
  const dotEnvPath = path.resolve(instancePath, '.env');
  await writeFile(dotEnvPath, `DB_URL=${databaseUrl}`, {
    encoding: 'utf8',
  });
  log.info(`Saved database URL to ${chalk.blue(dotEnvPath)}`);
};

export const logFinale = (instancePath: string) => {
  const startCommand = `cd ${instancePath} && npm start`;
  log.info(
    `Use the command below to start Logto. Happy hacking!\n\n  ${chalk.green(startCommand)}`
  );
};

export const inquireOfficialConnectors = async (initialAnswer?: boolean) => {
  const { value } = await inquirer.prompt<{ value: boolean }>(
    {
      name: 'value',
      message: 'Do you want to add official connectors?',
      type: 'confirm',
      default: true,
    },
    { value: initialAnswer }
  );

  return value;
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
