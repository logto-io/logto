import chalk from 'chalk';
import dotenv from 'dotenv';
import { findUp } from 'find-up';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import deploy from './commands/deploy/index.js';
import tunnel from './commands/tunnel/index.js';
import { packageJson } from './package-json.js';
import { consoleLog } from './utils.js';

dotenv.config({ path: await findUp('.env', {}) });

void yargs(hideBin(process.argv))
  .version(false)
  .env('LOGTO')
  .option('version', {
    alias: 'v',
    describe: 'Print CLI version',
    type: 'boolean',
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
  .strictCommands()
  .parserConfiguration({
    'dot-notation': false,
  })
  .epilog(
    `Refer to our documentation for more details:\n${chalk.blue(
      'https://docs.logto.io/docs/references/tunnel-cli'
    )}`
  )
  .parse();
