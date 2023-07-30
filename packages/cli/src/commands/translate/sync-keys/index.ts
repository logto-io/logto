import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { isLanguageTag } from '@logto/language-kit';
import { type CommandModule } from 'yargs';

import { consoleLog } from '../../../utils.js';
import { inquireInstancePath } from '../../connector/utils.js';

import { praseLocaleFiles, syncPhraseKeysAndFileStructure } from './utils.js';

const syncKeys: CommandModule<
  { path?: string },
  { path?: string; baseline: string; target: string }
> = {
  command: ['sync-keys', 'sk'],
  describe: 'Sync object keys and the file structure from baseline to target',
  builder: (yargs) =>
    yargs
      .option('baseline', {
        alias: 'b',
        type: 'string',
        describe: 'The baseline language tag',
        default: 'en',
      })
      .option('target', {
        alias: 't',
        type: 'string',
        describe: 'The target language tag, or `all` to sync all languages',
      })
      .demandOption(['baseline', 'target']),
  handler: async ({ path: inputPath, baseline: baselineTag, target: targetTag }) => {
    if (!isLanguageTag(baselineTag)) {
      consoleLog.fatal('Invalid baseline language tag');
    }

    if (targetTag !== 'all' && !isLanguageTag(targetTag)) {
      consoleLog.fatal('Invalid target language tag');
    }

    const instancePath = await inquireInstancePath(inputPath);
    const phrasesPath = path.join(instancePath, 'packages/phrases');
    const localesPath = path.join(phrasesPath, 'src/locales');
    const entrypoint = path.join(localesPath, baselineTag.toLowerCase(), 'index.ts');
    const baseline = praseLocaleFiles(entrypoint);
    const targetLocales = targetTag === 'all' ? fs.readdirSync(localesPath) : [targetTag];

    for (const target of targetLocales) {
      const targetDirectory = path.join(localesPath, target.toLowerCase());
      const targetEntrypoint = path.join(targetDirectory, 'index.ts');

      if (fs.existsSync(targetEntrypoint)) {
        const targetObject = praseLocaleFiles(targetEntrypoint)[0];
        syncPhraseKeysAndFileStructure(baseline, targetObject, targetDirectory);
      } else {
        consoleLog.warn(`Cannot find ${target} entrypoint, creating one`);
        fs.mkdirSync(targetDirectory);
        syncPhraseKeysAndFileStructure(baseline, {}, targetDirectory);
      }

      execSync(`pnpm exec eslint --ext .ts ${path.relative(phrasesPath, targetDirectory)} --fix`, {
        cwd: phrasesPath,
        stdio: 'inherit',
      });
    }
  },
};

export default syncKeys;
