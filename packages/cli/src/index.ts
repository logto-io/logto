import chalk from 'chalk';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import connector from './commands/connector/index.js';
import database from './commands/database/index.js';
import install from './commands/install/index.js';
import { packageJson } from './package-json.js';
import { cliConfig, ConfigKey, consoleLog } from './utils.js';

void yargs(hideBin(process.argv))
  .version(false)
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
  .option('version', {
    alias: 'v',
    describe: 'Print Logto CLI version',
    type: 'boolean',
    global: false,
  })
  .middleware(({ version }) => {
    if (version) {
      consoleLog.plain(packageJson.name + ' v' + packageJson.version);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    }
  }, true)
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
