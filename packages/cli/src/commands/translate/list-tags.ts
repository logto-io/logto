import { languages } from '@logto/language-kit';
import { isBuiltInLanguageTag as isPhrasesBuiltInLanguageTag } from '@logto/phrases';
import { isBuiltInLanguageTag as isPhrasesUiBuiltInLanguageTag } from '@logto/phrases-ui';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

const listTags: CommandModule<Record<string, unknown>> = {
  command: ['list-tags', 'list'],
  describe: 'List all available language tags',

  handler: async () => {
    for (const tag of Object.keys(languages)) {
      console.log(
        ...[
          tag,
          isPhrasesBuiltInLanguageTag(tag) && chalk.blue('phrases'),
          isPhrasesUiBuiltInLanguageTag(tag) && chalk.blue('phrases-ui'),
        ].filter(Boolean)
      );
    }
  },
};

export default listTags;
