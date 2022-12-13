import { noop } from '@silverhand/essentials';
import type { CommandModule } from 'yargs';

import add from './add.js';
import list from './list.js';
import remove from './remove.js';

const connector: CommandModule = {
  command: ['connector', 'c', 'connectors'],
  describe: 'Command for Logto connectors',
  builder: (yargs) =>
    yargs
      .option('path', {
        alias: 'p',
        type: 'string',
        describe: 'The path to your Logto instance directory',
      })
      .command(add)
      .command(list)
      .command(remove)
      .demandCommand(1),
  handler: noop,
};

export default connector;
