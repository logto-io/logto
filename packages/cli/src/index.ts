import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import os from 'os';
import path from 'path';

import chalk from 'chalk';
import ora from 'ora';
import * as prompts from 'prompts';
import * as semver from 'semver';
import tar from 'tar';

import { downloadFile, log, safeExecSync } from './utilities';

const pgRequired = new semver.SemVer('14.0.0');

const validateNodeVersion = () => {
  const required = new semver.SemVer('16.0.0');
  const current = new semver.SemVer(execSync('node -v', { encoding: 'utf8', stdio: 'pipe' }));

  if (required.compare(current) > 0) {
    log.error(`Logto requires NodeJS >=${required.version}, but ${current.version} found.`);
  }

  if (current.major > required.major) {
    log.warn(
      `Logto is tested under NodeJS ^${required.version}, but version ${current.version} found.`
    );
  }
};

const getInstancePath = async () => {
  const response = await prompts.default(
    [
      {
        name: 'instancePath',
        message: 'Where should we create your logto instance?',
        type: 'text',
        initial: './logto',
        format: (value: string) => path.resolve(value.trim()),
        validate: (value: string) =>
          existsSync(value) ? 'That path already exists, please try another.' : true,
      },
      {
        name: 'hasPostgresUrl',
        message: `Logto requires PostgreSQL >=${pgRequired.version} but cannot find in the current environment.\n  Do you have a remote PostgreSQL instance ready?`,
        type: () => {
          const pgOutput = safeExecSync('postgres --version') ?? '';
          // Filter out all brackets in the output since Homebrew will append `(Homebrew)`.
          const pgArray = pgOutput.split(' ').filter((value) => !value.startsWith('('));
          const pgCurrent = semver.coerce(pgArray[pgArray.length - 1]);

          return (!pgCurrent || pgCurrent.compare(pgRequired) < 0) && 'confirm';
        },
        format: (previous) => {
          if (!previous) {
            log.error('Logto requires a Postgres instance to run.');
          }
        },
      },
    ],
    {
      onCancel: () => {
        log.error('Operation cancelled');
      },
    }
  );

  return String(response.instancePath);
};

const tryStartInstance = async (instancePath: string) => {
  const response = await prompts.default({
    name: 'startInstance',
    message: 'Would you like to start Logto now?',
    type: 'confirm',
    initial: true,
  });

  const yes = Boolean(response.startInstance);
  const startCommand = `cd ${instancePath} && npm start`;

  if (yes) {
    execSync(startCommand, { stdio: 'inherit' });
  } else {
    log.info(`You can use ${startCommand} to start Logto. Happy hacking!`);
  }
};

const downloadRelease = async () => {
  const tarFilePath = path.resolve(os.tmpdir(), './logto.tar.gz');

  log.info(`Download Logto to ${tarFilePath}`);
  await downloadFile(
    'https://github.com/logto-io/logto/releases/latest/download/logto.tar.gz',
    tarFilePath
  );

  return tarFilePath;
};

const decompress = async (toPath: string, tarPath: string) => {
  const decompressSpinner = ora({
    text: `Decompress to ${toPath}`,
    prefixText: chalk.blue('[info]'),
  }).start();

  try {
    await mkdir(toPath);
    await tar.extract({ file: tarPath, cwd: toPath, strip: 1 });
  } catch {
    decompressSpinner.fail();

    return;
  }

  decompressSpinner.succeed();
};

const main = async () => {
  validateNodeVersion();

  const instancePath = await getInstancePath();
  const tarPath = await downloadRelease();

  await decompress(instancePath, tarPath);
  await tryStartInstance(instancePath);
};

void main();
