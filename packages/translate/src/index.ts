import chalk from 'chalk';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import create from './create.js';
import listTags from './list-tags.js';
import { packageJson } from './package-json.js';
import syncKeys from './sync-keys/index.js';
import sync from './sync.js';
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
    describe: 'Print Logto translate CLI version',
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
  .middleware(({ env }) => {
    dotenv.config({ path: env });
  })
  .option('path', {
    alias: 'p',
    type: 'string',
    describe: 'The path to your Logto instance directory',
  })
  .option('skip-core-check', {
    alias: 'sc',
    type: 'boolean',
    describe: 'Skip checking if the core package is existed',
  })
  .command(create)
  .command(listTags)
  .command(sync)
  .command(syncKeys)
  .demandCommand(1)
  .showHelpOnFail(false, `Specify ${chalk.green('--help')} for available options`)
  .strict()
  .parserConfiguration({
    'dot-notation': false,
  })
  .parse();
