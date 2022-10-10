import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import database from './commands/database';
import install from './commands/install';

void yargs(hideBin(process.argv))
  .option('env', {
    alias: ['e', 'env-file'],
    describe: 'The path to your `.env` file',
    type: 'string',
  })
  .middleware(({ env }) => {
    dotenv.config({ path: env });
  })
  .command(install)
  .command(database)
  .demandCommand(1)
  .showHelpOnFail(false)
  .strict()
  .parserConfiguration({
    'dot-notation': false,
  })
  .parse();
