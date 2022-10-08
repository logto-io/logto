import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import os from 'os';
import path from 'path';

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import * as semver from 'semver';
import tar from 'tar';
import { CommandModule } from 'yargs';

import { downloadFile, log, safeExecSync } from '../utilities';

export type InstallArgs = {
  path?: string;
  silent?: boolean;
};

const defaultPath = path.join(os.homedir(), 'logto');
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

const validatePath = (value: string) =>
  existsSync(path.resolve(value))
    ? `The path ${chalk.green(value)} already exists, please try another.`
    : true;

const getInstancePath = async () => {
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

  const { instancePath } = await inquirer.prompt<{ instancePath: string }>({
    name: 'instancePath',
    message: 'Where should we create your Logto instance?',
    type: 'input',
    default: defaultPath,
    filter: (value: string) => value.trim(),
    validate: validatePath,
  });

  return instancePath;
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
  } catch (error: unknown) {
    decompressSpinner.fail();
    log.error(error);

    return;
  }

  decompressSpinner.succeed();
};

const installLogto = async ({ path: pathArgument = defaultPath, silent = false }: InstallArgs) => {
  validateNodeVersion();

  const instancePath = (!silent && (await getInstancePath())) || pathArgument;
  const isValidPath = validatePath(instancePath);

  if (isValidPath !== true) {
    log.error(isValidPath);
  }

  const tarPath = await downloadRelease();

  await decompress(instancePath, tarPath);

  const startCommand = `cd ${instancePath} && npm start`;
  log.info(
    `Use the command below to start Logto. Happy hacking!\n\n  ${chalk.green(startCommand)}`
  );
};

const install: CommandModule<unknown, { path?: string; silent?: boolean }> = {
  command: ['init', 'i', 'install'],
  describe: 'Download and run the latest Logto release',
  builder: (yargs) =>
    yargs.options({
      path: {
        alias: 'p',
        describe: 'Path of Logto, must be a non-existing path',
        type: 'string',
      },
      silent: {
        alias: 's',
        describe: 'Entering non-interactive mode',
        type: 'boolean',
      },
    }),
  handler: async ({ path, silent }) => {
    await installLogto({ path, silent });
  },
};

export default install;
