import { CommandModule } from 'yargs';

import { noop } from '../../utilities';
import { getUrl } from './url';

const database: CommandModule = {
  command: ['database <command>', 'db'],
  describe: 'Commands for Logto database',
  builder: (yargs) => yargs.command(getUrl),
  handler: noop,
};

export default database;
