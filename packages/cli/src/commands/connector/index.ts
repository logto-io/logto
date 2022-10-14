import { noop } from '@silverhand/essentials';
import { CommandModule } from 'yargs';

import add from './add';
import list from './list';

const connector: CommandModule = {
  command: ['connector', 'c'],
  describe: 'Command for Logto connectors',
  builder: (yargs) =>
    yargs
      .option('path', { alias: 'p', type: 'string', describe: 'The path to your Logto instance' })
      .command(add)
      .command(list)
      .demandCommand(1),
  handler: noop,
};

export default connector;
