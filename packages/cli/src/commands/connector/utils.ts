import { exec } from 'child_process';
import { existsSync } from 'fs';
import { readFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

import { conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import { ensureDir, remove } from 'fs-extra';
import inquirer from 'inquirer';
import pRetry from 'p-retry';
import tar from 'tar';
import { z } from 'zod';

import { connectorDirectory } from '../../constants';
import { log, oraPromise } from '../../utilities';
import { defaultPath } from '../install/utils';

const coreDirectory = 'packages/core';
const execPromise = promisify(exec);
export const npmPackResultGuard = z
  .object({
    name: z.string(),
    version: z.string(),
    filename: z.string(),
  })
  .array();

const buildPathErrorMessage = (value: string) =>
  `The path ${chalk.green(value)} does not contain a Logto instance, please try another.`;

const validatePath = async (value: string) => {
  const corePackageJsonPath = path.resolve(path.join(value, coreDirectory, 'package.json'));

  if (!existsSync(corePackageJsonPath)) {
    return buildPathErrorMessage(value);
  }

  const packageJson = await readFile(corePackageJsonPath, { encoding: 'utf8' });
  const packageName = await z
    .object({ name: z.string() })
    .parseAsync(JSON.parse(packageJson))
    .then(({ name }) => name)
    .catch(() => '');

  if (packageName !== '@logto/core') {
    return buildPathErrorMessage(value);
  }

  return true;
};

export const inquireInstancePath = async (initialPath?: string) => {
  const { instancePath } = await inquirer.prompt<{ instancePath: string }>(
    {
      name: 'instancePath',
      message: 'Where is your Logto instance?',
      type: 'input',
      default: defaultPath,
      filter: (value: string) => value.trim(),
      validate: validatePath,
    },
    { instancePath: initialPath }
  );

  // Validate for initialPath
  const validated = await validatePath(instancePath);

  if (validated !== true) {
    log.error(validated);
  }

  return instancePath;
};

const packagePrefix = 'connector-';

export const normalizePackageName = (name: string) =>
  name
    .split('/')
    // Prepend prefix to the last fragment if needed
    .map((fragment, index, array) =>
      index === array.length - 1 && !fragment.startsWith(packagePrefix) && !fragment.startsWith('@')
        ? packagePrefix + fragment
        : fragment
    )
    .join('/');

export const addConnectors = async (instancePath: string, packageNames: string[]) => {
  const cwd = path.join(instancePath, coreDirectory, connectorDirectory);

  if (!existsSync(cwd)) {
    await mkdir(cwd);
  }

  log.info('Fetch connector metadata');

  const results = await Promise.all(
    packageNames
      .map((name) => normalizePackageName(name))
      .map(async (packageName) => {
        const run = async () => {
          const { stdout } = await execPromise(`npm pack ${packageName} --json`, { cwd });
          const result = npmPackResultGuard.parse(JSON.parse(stdout));

          if (!result[0]) {
            throw new Error(
              `Unable to execute ${chalk.green('npm pack')} on package ${chalk.green(packageName)}`
            );
          }

          const { filename, name } = result[0];
          const escapedFilename = filename.replace(/\//g, '-').replace(/@/g, '');
          const tarPath = path.join(cwd, escapedFilename);
          const packageDirectory = path.join(cwd, name.replace(/\//g, '-'));

          await remove(packageDirectory);
          await ensureDir(packageDirectory);
          await tar.extract({ cwd: packageDirectory, file: tarPath, strip: 1 });
          await unlink(tarPath);

          log.succeed(`Added ${chalk.green(name)}`);
        };

        try {
          await pRetry(run, { retries: 2 });
        } catch (error: unknown) {
          console.warn(`[${packageName}]`, error);

          return packageName;
        }
      })
  );

  const errorPackages = results.filter(Boolean);
  const errorCount = errorPackages.length;

  log.info(
    errorCount
      ? `Finished with ${errorCount} error${conditionalString(errorCount > 1 && 's')}.`
      : 'Finished'
  );

  if (errorCount) {
    log.warn('Failed to add ' + errorPackages.map((name) => chalk.green(name)).join(', '));
  }
};

const officialConnectorPrefix = '@logto/connector-';

const fetchOfficialConnectorList = async () => {
  const { stdout } = await execPromise(`npm search ${officialConnectorPrefix} --json`);
  const packages = z
    .object({ name: z.string() })
    .transform(({ name }) => name)
    .array()
    .parse(JSON.parse(stdout));

  return packages.filter((name) =>
    ['mock', 'kit'].every(
      (excluded) => !name.slice(officialConnectorPrefix.length).startsWith(excluded)
    )
  );
};

export const addOfficialConnectors = async (instancePath: string) => {
  const packages = await oraPromise(fetchOfficialConnectorList(), {
    text: 'Fetch official connector list',
    prefixText: chalk.blue('[info]'),
  });
  await addConnectors(instancePath, packages);
};
