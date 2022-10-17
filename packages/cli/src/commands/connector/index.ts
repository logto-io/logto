import { noop } from '@silverhand/essentials';
import { CommandModule } from 'yargs';

import add from './add';

const connector: CommandModule = {
  command: ['connector', 'c'],
  describe: 'Command for Logto connectors',
  builder: (yargs) => yargs.command(add).demandCommand(1),
  handler: noop,
};

export default connector;
