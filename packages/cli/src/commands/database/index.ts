import { CommandModule } from 'yargs';

import { noop } from '../../utilities';
import { getKey, setKey } from './key';
import seed from './seed';
import { getUrl, setUrl } from './url';

const database: CommandModule = {
  command: ['database', 'db'],
  describe: 'Commands for Logto database',
  builder: (yargs) =>
    yargs
      .command(getUrl)
      .command(setUrl)
      .command(getKey)
      .command(setKey)
      .command(seed)
      .demandCommand(1),
  handler: noop,
};

export default database;
