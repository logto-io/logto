import { noop } from '@silverhand/essentials';
import type { CommandModule } from 'yargs';

import create from './create.js';
import listTags from './list-tags.js';
import syncKeys from './sync-keys/index.js';
import sync from './sync.js';

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
      .option('skip-core-check', {
        alias: 'sc',
        type: 'boolean',
        describe: 'Skip checking if the core package is existed',
      })
      .command(create)
      .command(listTags)
      .command(sync)
      .command(syncKeys)
      .demandCommand(1),
  handler: noop,
};

export default translate;
