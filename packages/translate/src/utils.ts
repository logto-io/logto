import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs, { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { promisify } from 'node:util';

import { type LanguageTag } from '@logto/language-kit';
import { ConsoleLog } from '@logto/shared';
import { assert, conditional } from '@silverhand/essentials';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import type PQueue from 'p-queue';
import { z } from 'zod';

import { coreDirectory, defaultPath } from './constants.js';

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

export const getPathInModule = (moduleName: string, relativePath = '/') =>
  // https://stackoverflow.com/a/49455609/12514940
  path.join(
    path.dirname(createRequire(import.meta.url).resolve(`${moduleName}/package.json`)),
    relativePath
  );

export const isTty = () => process.stdin.isTTY;

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

export const baseLanguage = 'en' satisfies LanguageTag;

export const readLocaleFiles = async (directory: string): Promise<string[]> => {
  const entities = await fs.readdir(directory, { withFileTypes: true });

  const result = await Promise.all(
    entities.map(async (entity) => {
      if (entity.isDirectory()) {
        return readLocaleFiles(path.join(directory, entity.name));
      }

      return entity.name.endsWith('.ts') ? path.join(directory, entity.name) : [];
    })
  );

  return result.flat();
};

export const readBaseLocaleFiles = async (directory: string): Promise<string[]> => {
  const enDirectory = path.join(directory, baseLanguage.toLowerCase());
  const stat = await fs.stat(enDirectory);

  if (!stat.isDirectory()) {
    consoleLog.fatal(directory, 'has no `' + baseLanguage.toLowerCase() + '` directory');
  }

  return readLocaleFiles(enDirectory);
};

export type TranslationOptions = {
  instancePath: string;
  packageName: string;
  languageTag: LanguageTag;
  verbose?: boolean;
  queue?: PQueue;
};
