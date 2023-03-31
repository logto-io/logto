import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { type LanguageTag } from '@logto/language-kit';
import { conditionalString } from '@silverhand/essentials';
import PQueue from 'p-queue';

import { log } from '../../utils.js';

import { createOpenaiApi, translate } from './openai.js';

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
    log.error(directory, 'has no `' + baseLanguage.toLowerCase() + '` directory');
  }

  return readLocaleFiles(enDirectory);
};

export type CreateFullTranslation = {
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
}: CreateFullTranslation) => {
  const directory = path.join(instancePath, 'packages', packageName, 'src/locales');
  const files = await readBaseLocaleFiles(directory);

  if (verbose) {
    log.info(
      'Found ' +
        String(files.length) +
        ' file' +
        conditionalString(files.length !== 1 && 's') +
        ' in ' +
        packageName +
        ' to translate'
    );
  }

  const openai = createOpenaiApi();

  /* eslint-disable no-await-in-loop */
  for (const file of files) {
    const basePath = path.relative(path.join(directory, baseLanguage.toLowerCase()), file);
    const targetPath = path.join(directory, languageTag.toLowerCase(), basePath);

    const getTranslationPath = async () => {
      if (existsSync(targetPath)) {
        const currentContent = await fs.readFile(targetPath, 'utf8');

        if (currentContent.includes('// UNTRANSLATED')) {
          return targetPath;
        }

        if (verbose) {
          log.info(`Target path ${targetPath} exists and has no untranslated mark, skipping`);
        }

        return;
      }

      return file;
    };

    const translationPath = await getTranslationPath();

    if (!translationPath) {
      continue;
    }

    void queue.add(async () => {
      log.info(`Translating ${translationPath}`);
      const result = await translate(openai, languageTag, translationPath);

      if (!result) {
        log.error(`Unable to translate ${translationPath}`);
      }

      await fs.mkdir(path.parse(targetPath).dir, { recursive: true });
      await fs.writeFile(targetPath, result);
      log.succeed(`Translated ${targetPath}`);
    });
  }
  /* eslint-enable no-await-in-loop */

  return queue.onIdle();
};
