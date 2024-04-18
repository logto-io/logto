import { execSync, execFile } from 'node:child_process';
import { createWriteStream, existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { promisify } from 'node:util';

import { ConsoleLog } from '@logto/shared';
import type { Optional } from '@silverhand/essentials';
import { assert, conditional, conditionalString } from '@silverhand/essentials';
import chalk from 'chalk';
import type { Progress } from 'got';
import { got } from 'got';
import { HttpsProxyAgent } from 'hpagent';
import inquirer from 'inquirer';
import type { Options } from 'ora';
import ora from 'ora';
import { z } from 'zod';

import { coreDirectory, defaultPath } from './constants.js';

export const safeExecSync = (command: string) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch {}
};

// The explicit type annotation is required to make `.fatal()`
// works correctly without `return`:
//
// ```ts
// const foo: number | undefined;
// consoleLog.fatal();
// typeof foo // Still `number | undefined` without explicit type annotation
// ```
//
// For now I have no idea why.
export const consoleLog: ConsoleLog = new ConsoleLog();

export const getProxy = () => {
  const { HTTPS_PROXY, HTTP_PROXY, https_proxy, http_proxy } = process.env;

  return HTTPS_PROXY ?? https_proxy ?? HTTP_PROXY ?? http_proxy;
};

export const downloadFile = async (url: string, destination: string) => {
  const file = createWriteStream(destination);
  const proxy = getProxy();
  const stream = got.stream(url, {
    ...(proxy && { agent: { https: new HttpsProxyAgent({ proxy }) } }),
  });
  const spinner = ora({
    text: 'Connecting',
    prefixText: ConsoleLog.prefixes.info,
  }).start();

  stream.pipe(file);

  return new Promise((resolve, reject) => {
    stream.on('downloadProgress', ({ total, percent }: Progress) => {
      if (!total) {
        return;
      }

      // eslint-disable-next-line @silverhand/fp/no-mutation
      spinner.text = `${(percent * 100).toFixed(1)}%`;
    });

    file.on('error', (error) => {
      spinner.fail();
      reject(new Error(error.message));
    });

    file.on('finish', () => {
      file.close();
      spinner.succeed();
      resolve(file);
    });
  });
};

export const getPathInModule = (moduleName: string, relativePath = '/') =>
  // https://stackoverflow.com/a/49455609/12514940
  path.join(
    path.dirname(createRequire(import.meta.url).resolve(`${moduleName}/package.json`)),
    relativePath
  );

export const oraPromise = async <T>(
  promise: PromiseLike<T>,
  options?: Options,
  exitOnError = false
) => {
  const spinner = ora({ prefixText: ConsoleLog.prefixes.info, ...options }).start();

  try {
    const result = await promise;
    spinner.succeed();

    return result;
  } catch (error: unknown) {
    spinner.fail();

    if (exitOnError) {
      consoleLog.fatal(error);
    }

    throw error;
  }
};

export const isTty = () => process.stdin.isTTY;

export enum ConfigKey {
  DatabaseUrl = 'DB_URL',
}

export const cliConfig = new Map<ConfigKey, Optional<string>>();

export type GetCliConfigWithPrompt = {
  key: ConfigKey;
  readableKey: string;
  comments?: string;
  defaultValue?: string;
};

export const getCliConfigWithPrompt = async ({
  key,
  readableKey,
  comments,
  defaultValue,
}: GetCliConfigWithPrompt) => {
  if (cliConfig.has(key) || !isTty()) {
    return cliConfig.get(key);
  }

  const { input } = await inquirer.prompt<{ input?: string }>({
    type: 'input',
    name: 'input',
    message: `Enter your ${readableKey}${conditionalString(comments && ' ' + comments)}`,
    default: defaultValue,
  });

  cliConfig.set(key, input);

  return input;
};

// https://stackoverflow.com/a/53187807/12514940
/**
 * Returns the index of the last element in the array where predicate is true, and -1
 * otherwise.
 * @param array The source array to search in
 * @param predicate find calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
 */
export function findLastIndex<T>(
  array: readonly T[],
  predicate: (value: T, index: number, object: readonly T[]) => boolean
): number {
  // eslint-disable-next-line @silverhand/fp/no-let
  let { length } = array;

  // eslint-disable-next-line @silverhand/fp/no-mutation
  while (length--) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (predicate(array[length]!, length, array)) {
      return length;
    }
  }

  return -1;
}

const buildPathErrorMessage = (value: string) =>
  `The path ${chalk.green(value)} does not contain a Logto instance. Please try another.`;

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

export const inquireInstancePath = async (initialPath?: string, skipCoreCheck?: boolean) => {
  const inquire = async () => {
    if (!initialPath && (skipCoreCheck ?? (await validatePath('.')) === true)) {
      return path.resolve('.');
    }

    if (!isTty()) {
      assert(initialPath, new Error('Path is missing'));

      return initialPath;
    }

    const { instancePath } = await inquirer.prompt<{ instancePath: string }>(
      {
        name: 'instancePath',
        message: 'Where is your Logto instance?',
        type: 'input',
        default: defaultPath,
        filter: (value: string) => value.trim(),
        validate: conditional(!skipCoreCheck && validatePath),
      },
      { instancePath: initialPath }
    );

    return instancePath;
  };

  const instancePath = await inquire();

  if (!skipCoreCheck) {
    const validated = await validatePath(instancePath);

    if (validated !== true) {
      consoleLog.fatal(validated);
    }
  }

  return instancePath;
};

const getConnectorPackageName = async (directory: string) => {
  const filePath = path.join(directory, 'package.json');

  if (!existsSync(filePath)) {
    return;
  }

  const json = await readFile(filePath, 'utf8');
  const { name } = z.object({ name: z.string() }).parse(JSON.parse(json));

  if (name.startsWith('connector-') || Boolean(name.split('/')[1]?.startsWith('connector-'))) {
    return name;
  }
};

export type ConnectorPackage = {
  name: string;
  path: string;
};

export const getConnectorPackagesFromDirectory = async (directory: string) => {
  const content = await readdir(directory, 'utf8');
  const rawPackages = await Promise.all(
    content.map(async (value) => {
      const currentDirectory = path.join(directory, value);

      return { name: await getConnectorPackageName(currentDirectory), path: currentDirectory };
    })
  );

  return rawPackages.filter(
    (packageInfo): packageInfo is ConnectorPackage => typeof packageInfo.name === 'string'
  );
};

const execPromise = promisify(execFile);

export const lintLocaleFiles = async (
  /** Logto instance path */
  instancePath: string,
  /** Target package name, ignore to lint both `phrases` and `phrases-experience` packages */
  packageName?: string
) => {
  const spinner = ora({
    text: 'Running `eslint --fix` for locales',
  }).start();

  const targetPackages = packageName ? [packageName] : ['phrases', 'phrases-experience'];

  await Promise.all(
    targetPackages.map(async (packageName) => {
      const phrasesPath = path.join(instancePath, 'packages', packageName);
      const localesPath = path.join(phrasesPath, 'src/locales');
      await execPromise(
        'pnpm',
        ['eslint', '--ext', '.ts', path.relative(phrasesPath, localesPath), '--fix'],
        { cwd: phrasesPath }
      );
    })
  );

  spinner.succeed('Ran `eslint --fix` for locales');
};
