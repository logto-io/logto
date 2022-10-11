import chalk from 'chalk';
import { CommandModule } from 'yargs';

import { oraPromise } from '../../utilities';
import {
  addConnectors,
  fetchOfficialConnectorList,
  inquireInstancePath,
  normalizePackageName,
} from './utils';

const add: CommandModule<unknown, { packages: string[]; path?: string; official: boolean }> = {
  command: ['add [packages...]', 'a', 'install', 'i'],
  describe: 'Add specific Logto connectors',
  builder: (yargs) =>
    yargs
      .positional('packages', {
        describe: 'The additional connector package names',
        type: 'string',
        array: true,
        default: [],
      })
      .option('official', {
        alias: 'o',
        type: 'boolean',
        default: false,
        describe:
          'Add all official connectors.\n' +
          "If it's true, the specified package names will be ignored.",
      })
      .option('path', { alias: 'p', type: 'string', describe: 'The path to your Logto instance' }),
  handler: async ({ packages: packageNames, path, official }) => {
    const instancePath = await inquireInstancePath(path);

    const packages = official
      ? await oraPromise(fetchOfficialConnectorList(), {
          text: 'Fetch official connector list',
          prefixText: chalk.blue('[info]'),
        })
      : packageNames.map((name) => normalizePackageName(name));

    await addConnectors(instancePath, packages);
  },
};

export default add;
