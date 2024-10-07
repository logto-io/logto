import { languages } from '@logto/language-kit';
import { isBuiltInLanguageTag as isPhrasesBuiltInLanguageTag } from '@logto/phrases';
import PQueue from 'p-queue';
import type { CommandModule } from 'yargs';

import { syncTranslation } from './openai.js';
import {
  inquireInstancePath,
  lintLocaleFiles,
  type TranslationOptions,
  baseLanguage,
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
    const packages = packageName ? [packageName] : ['phrases', 'phrases-experience'];

    for (const languageTag of Object.keys(languages)) {
      if (languageTag === baseLanguage) {
        continue;
      }

      const baseOptions = {
        instancePath,
        verbose: false,
        queue,
      } satisfies Partial<TranslationOptions>;

      for (const packageName of packages) {
        /* eslint-disable no-await-in-loop */
        if (isPhrasesBuiltInLanguageTag(languageTag)) {
          await syncTranslation({
            ...baseOptions,
            packageName,
            languageTag,
          });
        }
        /* eslint-enable no-await-in-loop */
      }
    }

    await queue.onIdle();

    void lintLocaleFiles(instancePath, packageName);
  },
};

export default sync;
