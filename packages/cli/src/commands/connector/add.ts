import type { CommandModule } from 'yargs';

import { log } from '../../utils.js';

import { addConnectors, addOfficialConnectors, inquireInstancePath } from './utils.js';

const add: CommandModule<
  { path?: string },
  { packages?: string[]; path?: string; official: boolean; cloud: boolean }
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
      })
      .option('cloud', {
        describe: 'Add additional connectors for Logto Cloud',
        type: 'boolean',
        default: false,
        hidden: true,
      }),
  handler: async ({ packages: packageNames, path, official, cloud }) => {
    const instancePath = await inquireInstancePath(path);

    if (cloud && !official) {
      log.error('--cloud option can only be used with --official option');
    }

    if (official) {
      // Add demo connectors for Logto Cloud only
      await addOfficialConnectors(instancePath, cloud);
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
