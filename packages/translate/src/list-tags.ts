import { languages } from '@logto/language-kit';
import { isBuiltInLanguageTag as isPhrasesBuiltInLanguageTag } from '@logto/phrases';
import { isBuiltInLanguageTag as isPhrasesUiBuiltInLanguageTag } from '@logto/phrases-experience';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { consoleLog } from './utils.js';

const listTags: CommandModule<Record<string, unknown>> = {
  command: ['list-tags', 'list'],
  describe: 'List all available language tags',

  handler: async () => {
    for (const tag of Object.keys(languages)) {
      consoleLog.plain(
        ...[
          tag,
          isPhrasesBuiltInLanguageTag(tag) && chalk.blue('phrases'),
          isPhrasesUiBuiltInLanguageTag(tag) && chalk.blue('phrases-experience'),
        ].filter(Boolean)
      );
    }
  },
};

export default listTags;
