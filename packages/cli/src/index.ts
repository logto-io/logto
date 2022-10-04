import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import database from './commands/database';
import install from './commands/install';

void yargs(hideBin(process.argv))
  .command(install)
  .command(database)
  .demandCommand(1)
  .showHelpOnFail(true)
  .strict()
  .parserConfiguration({
    'dot-notation': false,
  })
  .parse();
