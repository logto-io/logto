import { existsSync } from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

import { connectorDirectory } from '@logto/cli/lib/constants.js';
import { getConnectorPackagesFromDirectory } from '@logto/cli/lib/utilities.js';
import type { AllConnector, CreateConnector } from '@logto/connector-kit';
import { validateConfig } from '@logto/connector-kit';
import { findPackage } from '@logto/shared';
import chalk from 'chalk';

import RequestError from '#src/errors/RequestError/index.js';
import { findAllConnectors, insertConnector } from '#src/queries/connector.js';

import { defaultConnectorMethods } from './consts.js';
import { metaUrl } from './meta-url.js';
import type { VirtualConnector, LogtoConnector } from './types.js';
import { getConnectorConfig, readUrl, validateConnectorModule } from './utilities/index.js';

const currentDirname = path.dirname(fileURLToPath(metaUrl));
// eslint-disable-next-line @silverhand/fp/no-let
let cachedVirtualConnectors: VirtualConnector[] | undefined;

export const loadVirtualConnectors = async () => {
  if (cachedVirtualConnectors) {
    return cachedVirtualConnectors;
  }

  const coreDirectory = await findPackage(currentDirname);
  const directory = coreDirectory && path.join(coreDirectory, connectorDirectory);

  if (!directory || !existsSync(directory)) {
    return [];
  }

  const connectorPackages = await getConnectorPackagesFromDirectory(directory);

  const connectors = await Promise.all(
    connectorPackages.map(async ({ path: packagePath, name }) => {
      try {
        // TODO: fix type and remove `/lib/index.js` suffix once we upgrade all connectors to ESM
        const {
          default: { default: createConnector },
          // eslint-disable-next-line no-restricted-syntax
        } = (await import(packagePath + '/lib/index.js')) as {
          default: {
            default: CreateConnector<AllConnector>;
          };
        };
        const rawConnector = await createConnector({ getConfig: getConnectorConfig });
        validateConnectorModule(rawConnector);

        const connector: VirtualConnector = {
          ...defaultConnectorMethods,
          ...rawConnector,
          metadata: {
            ...rawConnector.metadata,
            logo: await readUrl(rawConnector.metadata.logo, packagePath, 'svg'),
            logoDark:
              rawConnector.metadata.logoDark &&
              (await readUrl(rawConnector.metadata.logoDark, packagePath, 'svg')),
            readme: await readUrl(rawConnector.metadata.readme, packagePath, 'text'),
            configTemplate: await readUrl(
              rawConnector.metadata.configTemplate,
              packagePath,
              'text'
            ),
          },
          validateConfig: (config: unknown) => {
            validateConfig(config, rawConnector.configGuard);
          },
        };

        return connector;
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
  cachedVirtualConnectors = connectors.filter(
    (connector): connector is VirtualConnector => connector !== undefined
  );

  return cachedVirtualConnectors;
};

export const getLogtoConnectors = async (): Promise<LogtoConnector[]> => {
  const connectors = await findAllConnectors();

  const virtualConnectors = await loadVirtualConnectors();

  return connectors
    .map((connector) => {
      const { metadata, connectorId } = connector;
      const virtualConnector = virtualConnectors.find(({ metadata: { id } }) => id === connectorId);

      if (!virtualConnector) {
        return;
      }

      return {
        ...virtualConnector,
        metadata: { ...virtualConnector.metadata, ...metadata },
        dbEntry: connector,
      };
    })
    .filter((connector): connector is LogtoConnector => connector !== undefined);
};

export const getLogtoConnectorById = async (id: string): Promise<LogtoConnector> => {
  const connectors = await getLogtoConnectors();
  const pickedConnector = connectors.find(({ dbEntry }) => dbEntry.id === id);

  if (!pickedConnector) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  return pickedConnector;
};

export const initConnectors = async () => {
  const connectors = await findAllConnectors();
  const existingConnectors = new Map(connectors.map((connector) => [connector.id, connector]));
  const allConnectors = await loadVirtualConnectors();
  const newConnectors = allConnectors.filter(({ metadata: { id } }) => {
    const connector = existingConnectors.get(id);

    if (!connector) {
      return true;
    }

    return connector.config === JSON.stringify({});
  });

  await Promise.all(
    newConnectors.map(async ({ metadata: { id } }) => {
      await insertConnector({
        id,
        connectorId: id,
      });
    })
  );
};
