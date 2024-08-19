import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { type LanguageTag } from '@logto/language-kit';
import { conditionalString, trySafe } from '@silverhand/essentials';
import { type Got, got, HTTPError } from 'got';
import { HttpsProxyAgent } from 'hpagent';
import PQueue from 'p-queue';
import { z } from 'zod';

import { getTranslationPromptMessages, untranslatedMark } from './prompts.js';
import {
  baseLanguage,
  consoleLog,
  getProxy,
  readBaseLocaleFiles,
  type TranslationOptions,
} from './utils.js';

export const createOpenaiApi = () => {
  const proxy = getProxy();

  return got.extend({
    prefixUrl: process.env.OPENAI_API_PROXY_ENDPOINT ?? 'https://api.openai.com/v1',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    timeout: { request: 300_000 },
    ...(proxy && { agent: { https: new HttpsProxyAgent({ proxy, timeout: 300_000 }) } }),
  });
};

const gptResponseGuard = z.object({
  choices: z
    .object({
      message: z.object({ role: z.string(), content: z.string() }),
      finish_reason: z.string(),
    })
    .array(),
});

type TranslateConfig = {
  api: Got;
  sourceFilePath: string;
  targetLanguage: LanguageTag;
  extraPrompt?: string;
};

export const translate = async ({
  api,
  targetLanguage,
  sourceFilePath,
  extraPrompt,
}: TranslateConfig) => {
  const sourceFileContent = await fs.readFile(sourceFilePath, 'utf8');
  const response = await trySafe(
    api
      .post('chat/completions', {
        json: {
          // The full list of OPENAI model can be found at https://platform.openai.com/docs/models.
          model: process.env.OPENAI_MODEL_NAME ?? 'gpt-3.5-turbo-0125',
          messages: getTranslationPromptMessages({
            sourceFileContent,
            targetLanguage,
            extraPrompt,
          }),
        },
      })
      .json(),
    (error) => {
      consoleLog.warn(`Error while translating ${sourceFilePath}:`, String(error));

      if (error instanceof HTTPError) {
        consoleLog.warn(error.response.body);
      }
    }
  );

  if (!response) {
    return;
  }

  const guarded = gptResponseGuard.safeParse(response);

  if (!guarded.success) {
    consoleLog.warn(`Error while guarding response for ${sourceFilePath}:`, response);

    return;
  }

  const [entity] = guarded.data.choices;

  if (!entity) {
    consoleLog.warn(`No choice found in response when translating ${sourceFilePath}`);

    return;
  }

  if (entity.finish_reason !== 'stop') {
    consoleLog.warn(`Unexpected finish reason ${entity.finish_reason} for ${sourceFilePath}`);
  }

  const { content } = entity.message;
  const matched = /```(?:ts)?\n(.*)```/s.exec(content)?.[1];

  if (!matched) {
    // Treat as pure code
    if (['const ', 'import '].some((prefix) => content.startsWith(prefix))) {
      return content;
    }

    consoleLog.warn('No matching code snippet from response:', content);
  }

  return matched;
};

export const createFullTranslation = async ({
  instancePath,
  packageName,
  languageTag,
  verbose = true,
  queue = new PQueue({ concurrency: 10 }),
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
  queue = new PQueue({ concurrency: 10 }),
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
