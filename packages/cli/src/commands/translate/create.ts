import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { isLanguageTag, type LanguageTag } from '@logto/language-kit';
import { isBuiltInLanguageTag as isPhrasesBuiltInLanguageTag } from '@logto/phrases';
import { isBuiltInLanguageTag as isPhrasesUiBuiltInLanguageTag } from '@logto/phrases-ui';
import { conditionalString, type Optional } from '@silverhand/essentials';
import type { CommandModule } from 'yargs';

import { log } from '../../utils.js';
import { inquireInstancePath } from '../connector/utils.js';

import { createOpenaiApi, translate } from './openai.js';
import { baseLanguage, readBaseLocaleFiles } from './utils.js';

const createFullTranslation = async (
  instancePath: Optional<string>,
  packageName: 'phrases' | 'phrases-ui',
  languageTag: LanguageTag
) => {
  const directory = path.join(
    await inquireInstancePath(instancePath),
    'packages',
    packageName,
    'src/locales'
  );
  const files = await readBaseLocaleFiles(directory);

  log.info(
    'Found ' +
      String(files.length) +
      ' file' +
      conditionalString(files.length !== 1 && 's') +
      ' in ' +
      packageName +
      ' to translate'
  );

  const openai = createOpenaiApi();

  /* eslint-disable no-await-in-loop */
  for (const file of files) {
    const relativePath = path.relative(path.join(directory, baseLanguage), file);
    const targetPath = path.join(directory, languageTag, relativePath);

    if (existsSync(targetPath)) {
      log.info(`Target path ${targetPath} exists, skipping`);
      continue;
    }

    log.info(`Translating ${file}`);
    const result = await translate(openai, languageTag, file);

    if (!result) {
      log.error(`Unable to translate ${file}`);
    }

    await fs.mkdir(path.parse(targetPath).dir, { recursive: true });
    await fs.writeFile(targetPath, result);
    log.succeed(`Translated ${targetPath}`);
  }
  /* eslint-enable no-await-in-loop */
};

const create: CommandModule<{ path?: string }, { path?: string; 'language-tag': string }> = {
  command: ['create <language-tag>', 'c'],
  describe: 'Create a new language translation',
  builder: (yargs) =>
    yargs.positional('language-tag', {
      describe: 'The language tag to create, e.g. `af-ZA`.',
      type: 'string',
      demandOption: true,
    }),
  handler: async ({ path: inputPath, languageTag }) => {
    if (!isLanguageTag(languageTag)) {
      log.error('Invalid language tag. Run `logto translate list-tags` to see available list.');
    }

    if (isPhrasesBuiltInLanguageTag(languageTag)) {
      log.info(languageTag + ' is a built-in tag of phrases, skipping');
    } else {
      await createFullTranslation(inputPath, 'phrases', languageTag);
    }

    if (isPhrasesUiBuiltInLanguageTag(languageTag)) {
      log.info(languageTag + ' is a built-in tag of phrases-ui, skipping');
    } else {
      await createFullTranslation(inputPath, 'phrases-ui', languageTag);
    }
  },
};

export default create;
