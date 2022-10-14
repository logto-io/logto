import { noop } from '@silverhand/essentials';
import { CommandModule } from 'yargs';

import add from './add';
import list from './list';
import remove from './remove';

const connector: CommandModule = {
  command: ['connector', 'c'],
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
