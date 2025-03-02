import fs from 'node:fs';
import path from 'node:path';

import { isLanguageTag } from '@logto/language-kit';
import PQueue from 'p-queue';
import type { CommandModule } from 'yargs';

import { model, syncTranslation } from './openai.js';
import {
  inquireInstancePath,
  lintLocaleFiles,
  type TranslationOptions,
  baseLanguage,
  consoleLog,
} from './utils.js';

const sync: CommandModule<
  { path?: string; skipCoreCheck?: boolean },
  { path?: string; skipCoreCheck?: boolean; package: string }
> = {
  command: ['sync'],
  describe:
    'Translate all untranslated phrases using ChatGPT. Note the environment variable `OPENAI_API_KEY` is required to work.',
  builder: (yargs) =>
    yargs.option('package', {
      alias: 'pkg',
      type: 'string',
      describe: 'The package name of the phrases, e.g. `phrases` or `phrases-experience`',
      default: 'phrases',
    }),
  handler: async ({ path: inputPath, skipCoreCheck, package: packageName }) => {
    const queue = new PQueue({ concurrency: 10 });
    const instancePath = await inquireInstancePath(inputPath, skipCoreCheck);
    const phrasesPath = path.join(instancePath, 'packages', packageName);
    const localesPath = path.join(phrasesPath, 'src/locales');
    const targetLocales = fs.readdirSync(localesPath);
    consoleLog.info(`Translating files using model ${model}`);

    for (const languageTag of targetLocales) {
      if (languageTag === baseLanguage || !isLanguageTag(languageTag)) {
        continue;
      }

      const baseOptions = {
        instancePath,
        verbose: false,
        queue,
      } satisfies Partial<TranslationOptions>;

      // eslint-disable-next-line no-await-in-loop
      await syncTranslation({
        ...baseOptions,
        packageName,
        languageTag,
      });
    }

    await queue.onIdle();

    void lintLocaleFiles(instancePath, packageName);
  },
};

export default sync;
