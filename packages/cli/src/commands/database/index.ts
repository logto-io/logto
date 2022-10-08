import { CommandModule } from 'yargs';

import { noop } from '../../utilities';
import { getUrl, setUrl } from './url';

const database: CommandModule = {
  command: ['database', 'db'],
  describe: 'Commands for Logto database',
  builder: (yargs) => yargs.command(getUrl).command(setUrl).strict(),
  handler: noop,
};

export default database;
