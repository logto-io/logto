import chalk from 'chalk';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import deploy from './commands/deploy/index.js';
import tunnel from './commands/tunnel/index.js';
import { packageJson } from './package-json.js';
import { consoleLog } from './utils.js';

void yargs(hideBin(process.argv))
  .version(false)
  .option('env', {
    alias: ['e', 'env-file'],
    describe: 'The path to your `.env` file',
    type: 'string',
  })
  .option('version', {
    alias: 'v',
    describe: 'Print CLI version',
    type: 'boolean',
  })
  .middleware(({ env }) => {
    dotenv.config({ path: env });
  })
  .middleware(({ version }) => {
    if (version) {
      consoleLog.plain(packageJson.name + ' v' + packageJson.version);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    }
  }, true)
  .command(tunnel)
  .command(deploy)
  .showHelpOnFail(false, `Specify ${chalk.green('--help')} for available options`)
  .strict()
  .parserConfiguration({
    'dot-notation': false,
  })
  .parse();
