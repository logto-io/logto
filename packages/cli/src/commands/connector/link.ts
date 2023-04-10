import fs from 'node:fs/promises';
import path from 'node:path';

import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import { getConnectorDirectory, getLocalConnectorPackages, inquireInstancePath } from './utils.js';

const link: CommandModule<{ path?: string }, { path?: string; cloud: boolean; mock: boolean }> = {
  command: ['link', 'ln'],
  describe: 'Link all connectors in `packages/connectors`, useful for adding local connectors.',
  builder: (yargs) =>
    yargs
      .option('cloud', {
        describe: 'Add additional connectors for Logto Cloud',
        type: 'boolean',
        default: false,
        hidden: true,
      })
      .option('mock', {
        describe: 'Add mock connectors',
        type: 'boolean',
        default: false,
        hidden: true,
      }),
  handler: async ({ path: inputPath, cloud, mock }) => {
    const instancePath = await inquireInstancePath(inputPath);
    const packages = await getLocalConnectorPackages(instancePath);
    const connectorDirectory = getConnectorDirectory(instancePath);

    await fs.mkdir(connectorDirectory, { recursive: true });

    await Promise.all(
      packages.map(async ([packageName, packagePath]) => {
        if (!cloud && packageName.startsWith('connector-logto-')) {
          return;
        }

        if (!mock && packageName.startsWith('connector-mock-')) {
          return;
        }

        try {
          const targetPath = path.join(connectorDirectory, '@logto-' + packageName);

          await fs.rm(targetPath, { recursive: true, force: true });
          await fs.symlink(path.relative(connectorDirectory, packagePath), targetPath);
        } catch (error) {
          consoleLog.warn(error);

          return;
        }

        consoleLog.succeed('Linked', packagePath);
      })
    );
  },
};

export default link;
