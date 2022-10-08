import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import database from './commands/database';
import install from './commands/install';

dotenv.config();

void yargs(hideBin(process.argv))
  .command(install)
  .command(database)
  .demandCommand(1)
  .showHelpOnFail(false)
  .strict()
  .parserConfiguration({
    'dot-notation': false,
  })
  .parse();
