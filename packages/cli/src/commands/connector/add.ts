import type { CommandModule } from 'yargs';

import { log } from '../../utilities.js';
import { addConnectors, addOfficialConnectors, inquireInstancePath } from './utils.js';

const add: CommandModule<
  { path?: string },
  { packages?: string[]; path?: string; official: boolean }
> = {
  command: ['add [packages...]', 'a', 'install', 'i'],
  describe: 'Add specific Logto connectors',
  builder: (yargs) =>
    yargs
      .positional('packages', {
        describe: 'The connector package names to add',
        type: 'string',
        array: true,
        default: undefined,
      })
      .option('official', {
        alias: 'o',
        type: 'boolean',
        default: false,
        describe:
          'Add all official connectors.\n' +
          "If it's true, the specified package names will be ignored.",
      }),
  handler: async ({ packages: packageNames, path, official }) => {
    const instancePath = await inquireInstancePath(path);

    if (official) {
      await addOfficialConnectors(instancePath);
    } else {
      if (!packageNames?.length) {
        log.error('No connector name provided');
      }
      await addConnectors(instancePath, packageNames);
    }

    log.info('Restart your Logto instance to get the changes reflected.');
  },
};

export default add;
