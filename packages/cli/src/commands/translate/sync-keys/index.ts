import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { isLanguageTag } from '@logto/language-kit';
import ora from 'ora';
import { type CommandModule } from 'yargs';

import { consoleLog } from '../../../utils.js';
import { inquireInstancePath } from '../../connector/utils.js';

import { praseLocaleFiles, syncPhraseKeysAndFileStructure } from './utils.js';

const execPromise = promisify(execFile);

const syncKeys: CommandModule<
  { path?: string },
  { path?: string; baseline: string; target: string; skipLint?: boolean; package: string }
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
        describe: 'The package name of the phrases, one of `phrases` or `phrases-ui`',
        default: 'phrases',
      })
      .option('target', {
        alias: 't',
        type: 'string',
        describe: 'The target language tag, or `all` to sync all languages',
      })
      .option('skip-lint', {
        alias: 's',
        type: 'boolean',
        describe: 'Skip running `eslint --fix` for locales after syncing',
      })
      .demandOption(['baseline', 'target']),
  handler: async ({
    path: inputPath,
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

    if (packageName !== 'phrases' && packageName !== 'phrases-ui') {
      consoleLog.fatal('Invalid package name, expected `phrases` or `phrases-ui`');
    }

    const instancePath = await inquireInstancePath(inputPath);
    const phrasesPath = path.join(instancePath, 'packages', packageName);
    const localesPath = path.join(phrasesPath, 'src/locales');
    const entrypoint = path.join(localesPath, baselineTag.toLowerCase(), 'index.ts');
    const baseline = praseLocaleFiles(entrypoint);
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
      const spinner = ora({
        text: 'Running `eslint --fix` for locales',
      }).start();
      await execPromise(
        'pnpm',
        ['eslint', '--ext', '.ts', path.relative(phrasesPath, localesPath), '--fix'],
        { cwd: phrasesPath }
      );
      spinner.succeed('Ran `eslint --fix` for locales');
    }
  },
};

export default syncKeys;
