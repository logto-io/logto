import fs from 'node:fs';
import path from 'node:path';

import { isLanguageTag } from '@logto/language-kit';
import ora from 'ora';
import { type CommandModule } from 'yargs';

import { consoleLog, inquireInstancePath, lintLocaleFiles } from '../utils.js';

import { parseLocaleFiles, syncPhraseKeysAndFileStructure } from './utils.js';

const syncKeys: CommandModule<
  { path?: string; skipCoreCheck?: boolean },
  {
    path?: string;
    skipCoreCheck?: boolean;
    baseline: string;
    target: string;
    skipLint?: boolean;
    package: string;
  }
> = {
  command: ['sync-keys', 'sk'],
  describe: [
    'Sync nested object keys and the file structure from baseline to target.',
    'If a key is missing in the target, it will be added with a comment to indicate that the phrase is untranslated;',
    'If a key is missing in the baseline, it will be removed from the target;',
    'If a key exists in both the baseline and the target, the value of the target will be used.',
  ].join(' '),
  builder: (yargs) =>
    yargs
      .option('baseline', {
        alias: 'b',
        type: 'string',
        describe: 'The baseline language tag',
        default: 'en',
      })
      .option('package', {
        alias: 'pkg',
        type: 'string',
        describe: 'The package name of the phrases, e.g. `phrases` or `phrases-experience`',
        default: 'phrases',
      })
      .option('target', {
        alias: 't',
        type: 'string',
        describe: 'The target language tag, or `all` to sync all languages',
      })
      .option('skip-lint', {
        alias: 'sl',
        type: 'boolean',
        describe: 'Skip running `eslint --fix` for locales after syncing',
      })
      .demandOption(['baseline', 'target']),
  handler: async ({
    path: inputPath,
    skipCoreCheck,
    baseline: baselineTag,
    target: targetTag,
    skipLint,
    package: packageName,
  }) => {
    if (!isLanguageTag(baselineTag)) {
      consoleLog.fatal('Invalid baseline language tag');
    }

    if (targetTag !== 'all' && !isLanguageTag(targetTag)) {
      consoleLog.fatal('Invalid target language tag');
    }

    if (baselineTag === targetTag) {
      consoleLog.fatal('Baseline and target cannot be the same');
    }

    const instancePath = await inquireInstancePath(inputPath, skipCoreCheck);
    const phrasesPath = path.join(instancePath, 'packages', packageName);
    const localesPath = path.join(phrasesPath, 'src/locales');
    const entrypoint = path.join(localesPath, baselineTag.toLowerCase(), 'index.ts');
    const baseline = parseLocaleFiles(entrypoint);
    const targetLocales =
      targetTag === 'all' ? fs.readdirSync(localesPath) : [targetTag.toLowerCase()];

    /* eslint-disable no-await-in-loop */
    for (const target of targetLocales) {
      if (target === baselineTag) {
        continue;
      }

      const spinner = ora({
        text: `Syncing object keys and file structure from ${baselineTag} to ${target}`,
      }).start();
      const targetDirectory = path.join(localesPath, target);

      await syncPhraseKeysAndFileStructure(baseline, target, targetDirectory);

      spinner.succeed(`Synced object keys and file structure from ${baselineTag} to ${target}`);
    }
    /* eslint-enable no-await-in-loop */

    if (!skipLint) {
      void lintLocaleFiles(instancePath, packageName);
    }
  },
};

export default syncKeys;
