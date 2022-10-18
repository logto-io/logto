import { noop } from '@silverhand/essentials';
import { CommandModule } from 'yargs';

import alteration from './alteration';
import { getConfig, setConfig } from './config';
import seed from './seed';

const database: CommandModule = {
  command: ['database', 'db'],
  describe: 'Commands for Logto database',
  builder: (yargs) =>
    yargs.command(getConfig).command(setConfig).command(seed).command(alteration).demandCommand(1),
  handler: noop,
};

export default database;
