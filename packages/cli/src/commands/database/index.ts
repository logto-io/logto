import { noop } from '@silverhand/essentials';
import type { CommandModule } from 'yargs';

import alteration from './alteration/index.js';
import config from './config.js';
import ogcio from './ogcio/index.js';
import seed from './seed/index.js';
import system from './system.js';

const database: CommandModule = {
  command: ['database', 'db'],
  describe: 'Commands for Logto database',
  builder: (yargs) =>
    yargs
      .command(config)
      .command(seed)
      .command(alteration)
      .command(system)
      .command(ogcio)
      .demandCommand(1),
  handler: noop,
};

export default database;
