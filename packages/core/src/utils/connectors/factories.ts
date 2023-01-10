import { existsSync } from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

import { connectorDirectory } from '@logto/cli/lib/constants.js';
import { getConnectorPackagesFromDirectory } from '@logto/cli/lib/utilities.js';
import { findPackage } from '@logto/shared';
import chalk from 'chalk';

import type { ConnectorFactory } from '#src/utils/connectors/types.js';

import { notImplemented } from './consts.js';
import { parseMetadata, validateConnectorModule } from './index.js';
import { loadConnector } from './loader.js';

// eslint-disable-next-line @silverhand/fp/no-let
let cachedConnectorFactories: ConnectorFactory[] | undefined;

export const loadConnectorFactories = async () => {
  if (cachedConnectorFactories) {
    return cachedConnectorFactories;
  }

  const currentDirname = path.dirname(fileURLToPath(import.meta.url));
  const coreDirectory = await findPackage(currentDirname);
  const directory = coreDirectory && path.join(coreDirectory, connectorDirectory);

  if (!directory || !existsSync(directory)) {
    return [];
  }

  const connectorPackages = await getConnectorPackagesFromDirectory(directory);

  const connectorFactories = await Promise.all(
    connectorPackages.map(async ({ path: packagePath, name }) => {
      try {
        const createConnector = await loadConnector(packagePath);
        const rawConnector = await createConnector({ getConfig: notImplemented });
        validateConnectorModule(rawConnector);

        return {
          metadata: await parseMetadata(rawConnector.metadata, packagePath),
          type: rawConnector.type,
          createConnector,
          path: packagePath,
        };
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(
            `${chalk.red(
              `[load-connector] skip ${chalk.bold(name)} due to error: ${error.message}`
            )}`
          );

          return;
        }

        throw error;
      }
    })
  );

  // eslint-disable-next-line @silverhand/fp/no-mutation
  cachedConnectorFactories = connectorFactories.filter(
    (connectorFactory): connectorFactory is ConnectorFactory => connectorFactory !== undefined
  );

  return cachedConnectorFactories;
};
