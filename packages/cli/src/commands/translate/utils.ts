import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { type LanguageTag } from '@logto/language-kit';
import { conditionalString } from '@silverhand/essentials';
import { type Got } from 'got';
import PQueue from 'p-queue';

import { consoleLog } from '../../utils.js';

import { createOpenaiApi, translate } from './openai.js';

export const baseLanguage = 'en' satisfies LanguageTag;

const untranslatedMark = '// UNTRANSLATED';

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
  packageName: 'phrases' | 'phrases-ui';
  languageTag: LanguageTag;
  verbose?: boolean;
  queue?: PQueue;
};

export const createFullTranslation = async ({
  instancePath,
  packageName,
  languageTag,
  verbose = true,
  queue = new PQueue({ concurrency: 5 }),
}: TranslationOptions) => {
  const localeFiles = await getBaseAndTargetLocaleFiles(instancePath, packageName, languageTag);

  if (verbose) {
    consoleLog.info(
      'Found ' +
        String(localeFiles.length) +
        ' file' +
        conditionalString(localeFiles.length !== 1 && 's') +
        ' in ' +
        packageName +
        ' to create'
    );
  }

  const openai = createOpenaiApi();

  for (const { baseLocaleFile, targetLocaleFile } of localeFiles) {
    if (existsSync(targetLocaleFile)) {
      if (verbose) {
        consoleLog.info(`Target locale file ${targetLocaleFile} exists, skipping`);
      }

      continue;
    }

    void createLocaleFile({
      api: openai,
      baseLocaleFile,
      targetPath: targetLocaleFile,
      targetLanguage: languageTag,
      queue,
    });
  }

  return queue.onIdle();
};

export const syncTranslation = async ({
  instancePath,
  packageName,
  languageTag,
  verbose = true,
  queue = new PQueue({ concurrency: 5 }),
}: TranslationOptions) => {
  const localeFiles = await getBaseAndTargetLocaleFiles(instancePath, packageName, languageTag);

  if (verbose) {
    consoleLog.info(
      'Found ' +
        String(localeFiles.length) +
        ' file' +
        conditionalString(localeFiles.length !== 1 && 's') +
        ' in ' +
        packageName +
        ' to translate'
    );
  }

  const openai = createOpenaiApi();

  /* eslint-disable no-await-in-loop */
  for (const { baseLocaleFile, targetLocaleFile } of localeFiles) {
    if (!existsSync(targetLocaleFile)) {
      void createLocaleFile({
        api: openai,
        baseLocaleFile,
        targetPath: targetLocaleFile,
        targetLanguage: languageTag,
        queue,
      });

      continue;
    }

    const currentContent = await fs.readFile(targetLocaleFile, 'utf8');

    if (!currentContent.includes(untranslatedMark)) {
      if (verbose) {
        consoleLog.info(
          `Target path ${targetLocaleFile} exists and has no untranslated mark, skipping`
        );
      }
      continue;
    }

    void queue.add(async () => {
      consoleLog.info(`Translating ${targetLocaleFile}`);
      const result = await translate({
        api: openai,
        sourceFilePath: targetLocaleFile,
        targetLanguage: languageTag,
        extraPrompt: `Object values without an "${untranslatedMark}" mark should be skipped and keep its original value. Remember to remove the "${untranslatedMark}" mark with the spaces before and after it in the output content.`,
      });

      if (!result) {
        consoleLog.fatal(`Unable to translate ${targetLocaleFile}`);
      }

      await fs.unlink(targetLocaleFile);
      await fs.writeFile(targetLocaleFile, result);
      consoleLog.succeed(`Translated ${targetLocaleFile}`);
    });
  }
  /* eslint-enable no-await-in-loop */

  return queue.onIdle();
};

const getBaseAndTargetLocaleFiles = async (
  instancePath: string,
  packageName: string,
  languageTag: LanguageTag
) => {
  const directory = path.join(instancePath, 'packages', packageName, 'src/locales');
  const baseLocaleFiles = await readBaseLocaleFiles(directory);

  return baseLocaleFiles.map((baseLocaleFile) => {
    const basePath = path.relative(
      path.join(directory, baseLanguage.toLowerCase()),
      baseLocaleFile
    );

    return {
      baseLocaleFile,
      targetLocaleFile: path.join(directory, languageTag.toLowerCase(), basePath),
    };
  });
};

type OperateLocaleFileOptions = {
  api: Got;
  baseLocaleFile: string;
  targetPath: string;
  targetLanguage: LanguageTag;
  queue: PQueue;
};

const createLocaleFile = async ({
  api,
  baseLocaleFile,
  targetPath,
  targetLanguage,
  queue,
}: OperateLocaleFileOptions) =>
  queue.add(async () => {
    consoleLog.info(`Creating the translation for ${targetPath}`);
    const result = await translate({
      api,
      sourceFilePath: baseLocaleFile,
      targetLanguage,
    });

    if (!result) {
      consoleLog.fatal(`Unable to create the translation for ${targetPath}`);
    }

    await fs.mkdir(path.parse(targetPath).dir, { recursive: true });
    await fs.writeFile(targetPath, result);
    consoleLog.succeed(`The translation for ${targetPath} created`);
  });
