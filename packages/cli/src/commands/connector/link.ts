import fs from 'node:fs/promises';
import path from 'node:path';

import type { CommandModule } from 'yargs';

import { log } from '../../utils.js';

import { getConnectorDirectory, getLocalConnectorPackages, inquireInstancePath } from './utils.js';

const link: CommandModule<{ path?: string }, { path?: string }> = {
  command: ['link', 'ln'],
  describe: 'Link all connectors in `packages/connectors`, useful for adding local connectors.',
  handler: async ({ path: inputPath }) => {
    const instancePath = await inquireInstancePath(inputPath);
    const packages = await getLocalConnectorPackages(instancePath);
    await Promise.all(
      packages.map(async ([packageName, packagePath]) => {
        try {
          const targetPath = path.join(
            getConnectorDirectory(instancePath),
            '@logto-' + packageName
          );

          await fs.rm(targetPath, { recursive: true, force: true });
          await fs.symlink(path.resolve(packagePath), targetPath);
        } catch (error) {
          log.warn(error);

          return;
        }

        log.succeed('Linked', packagePath);
      })
    );
  },
};

export default link;
