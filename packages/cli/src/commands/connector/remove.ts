import fs from 'node:fs/promises';

import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import { getConnectorPackagesFrom } from './utils.js';

const remove: CommandModule<{ path?: string }, { path?: string; packages?: string[] }> = {
  command: ['remove [packages...]', 'rm', 'delete'],
  describe: 'Remove existing Logto connectors',
  builder: (yargs) =>
    yargs.positional('packages', {
      describe: 'The connector package names to remove',
      type: 'string',
      array: true,
      default: undefined,
    }),
  handler: async ({ path: inputPath, packages: packageNames }) => {
    if (!packageNames?.length) {
      consoleLog.fatal('No connector name provided');
    }

    const existingPackages = await getConnectorPackagesFrom(inputPath);
    const notFoundPackageNames = packageNames.filter(
      (current) => !existingPackages.some(({ name }) => current === name)
    );

    if (notFoundPackageNames.length > 0) {
      consoleLog.fatal(
        `Cannot remove ${notFoundPackageNames
          .map((name) => chalk.green(name))
          .join(', ')}: not found in your Logto instance directory`
      );
    }

    const okSymbol = Symbol('Connector removed');
    const result = await Promise.all(
      packageNames.map(async (current) => {
        const packageInfo = existingPackages.find(({ name }) => name === current);

        try {
          await fs.rm(packageInfo?.path ?? '', { force: true, recursive: true });

          return okSymbol;
        } catch (error: unknown) {
          consoleLog.warn(`Error while removing ${chalk.green(packageInfo?.name)}`);
          consoleLog.warn(error);

          return error;
        }
      })
    );
    const errorCount = result.filter((value) => value !== okSymbol).length;

    consoleLog.info(`Removed ${result.length - errorCount} connectors`);
  },
};

export default remove;
