import { noop } from '@silverhand/essentials';
import type { CommandModule } from 'yargs';

import create from './create.js';
import listTags from './list-tags.js';

const translate: CommandModule = {
  command: ['translate', 't'],
  describe: 'Commands for Logto translation',
  builder: (yargs) =>
    yargs
      .option('path', {
        alias: 'p',
        type: 'string',
        describe: 'The path to your Logto instance directory',
      })
      .command(create)
      .command(listTags)
      .demandCommand(1),
  handler: noop,
};

export default translate;
