import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import install from './commands/install';

void yargs(hideBin(process.argv))
  .command(
    ['init', 'i', 'install'],
    'Download and run the latest Logto release',
    {
      path: {
        alias: 'p',
        describe: 'Path of Logto, must be a non-existing path',
        type: 'string',
      },
      silent: {
        alias: 's',
        describe: 'Entering non-interactive mode',
        type: 'boolean',
      },
    },
    async ({ path, silent }) => {
      await install({ path, silent });
    }
  )
  .demandCommand(1)
  .showHelpOnFail(true)
  .strict()
  .parserConfiguration({
    'dot-notation': false,
  })
  .parse();
