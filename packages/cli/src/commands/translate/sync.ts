import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

import { languages } from '@logto/language-kit';
import { isBuiltInLanguageTag as isPhrasesBuiltInLanguageTag } from '@logto/phrases';
import { isBuiltInLanguageTag as isPhrasesUiBuiltInLanguageTag } from '@logto/phrases-ui';
import ora from 'ora';
import PQueue from 'p-queue';
import type { CommandModule } from 'yargs';

import { inquireInstancePath } from '../connector/utils.js';

import { type TranslationOptions, baseLanguage, syncTranslation } from './utils.js';

const execPromise = promisify(execFile);

const sync: CommandModule<{ path?: string }, { path?: string }> = {
  command: ['sync'],
  describe:
    'Translate all untranslated phrases using ChatGPT. Note the environment variable `OPENAI_API_KEY` is required to work.',
  handler: async ({ path: inputPath }) => {
    const queue = new PQueue({ concurrency: 1 });
    const instancePath = await inquireInstancePath(inputPath);

    /* eslint-disable no-await-in-loop */
    for (const languageTag of Object.keys(languages)) {
      if (languageTag === baseLanguage) {
        continue;
      }

      const baseOptions = {
        instancePath,
        verbose: false,
        queue,
      } satisfies Partial<TranslationOptions>;

      if (isPhrasesBuiltInLanguageTag(languageTag)) {
        await syncTranslation({
          ...baseOptions,
          packageName: 'phrases',
          languageTag,
        });
      }

      if (isPhrasesUiBuiltInLanguageTag(languageTag)) {
        await syncTranslation({
          ...baseOptions,
          packageName: 'phrases-ui',
          languageTag,
        });
      }
    }
    /* eslint-enable no-await-in-loop */

    await queue.onIdle();

    const spinner = ora({
      text: 'Running `eslint --fix` for locales',
    }).start();

    const phrasesPath = path.join(instancePath, 'packages/phrases');
    const localesPath = path.join(phrasesPath, 'src/locales');
    await execPromise(
      'pnpm',
      ['eslint', '--ext', '.ts', path.relative(phrasesPath, localesPath), '--fix'],
      { cwd: phrasesPath }
    );

    const phrasesUiPath = path.join(instancePath, 'packages/phrases-ui');
    const localesUiPath = path.join(phrasesUiPath, 'src/locales');
    await execPromise(
      'pnpm',
      ['eslint', '--ext', '.ts', path.relative(phrasesUiPath, localesUiPath), '--fix'],
      { cwd: phrasesUiPath }
    );

    spinner.succeed('Ran `eslint --fix` for locales');
  },
};

export default sync;
