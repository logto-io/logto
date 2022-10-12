import chalk from 'chalk';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import connector from './commands/connector';
import database from './commands/database';
import install from './commands/install';
import { cliConfig, ConfigKey } from './utilities';

void yargs(hideBin(process.argv))
  .option('env', {
    alias: ['e', 'env-file'],
    describe: 'The path to your `.env` file',
    type: 'string',
  })
  .option('db', {
    alias: ['db-url', 'database-url'],
    describe: 'The Postgres URL to Logto database',
    type: 'string',
  })
  .middleware(({ env, db: databaseUrl }) => {
    dotenv.config({ path: env });

    const initialDatabaseUrl = databaseUrl ?? process.env[ConfigKey.DatabaseUrl];

    if (initialDatabaseUrl) {
      cliConfig.set(ConfigKey.DatabaseUrl, initialDatabaseUrl);
    }
  })
  .command(install)
  .command(database)
  .command(connector)
  .demandCommand(1)
  .showHelpOnFail(false, `Specify ${chalk.green('--help')} for available options`)
  .strict()
  .parserConfiguration({
    'dot-notation': false,
  })
  .parse();
