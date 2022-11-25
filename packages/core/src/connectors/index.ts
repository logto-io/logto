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
import type { ConnectorFactory, LogtoConnector } from './types.js';
import { getConnectorConfig, readUrl, validateConnectorModule } from './utilities/index.js';

const currentDirname = path.dirname(fileURLToPath(metaUrl));

// eslint-disable-next-line @silverhand/fp/no-let
let cachedConnectorFactories: ConnectorFactory[] | undefined;

export const loadConnectorFactories = async () => {
  if (cachedConnectorFactories) {
    return cachedConnectorFactories;
  }

  const coreDirectory = await findPackage(currentDirname);
  const directory = coreDirectory && path.join(coreDirectory, connectorDirectory);

  if (!directory || !existsSync(directory)) {
    return [];
  }

  const connectorPackages = await getConnectorPackagesFromDirectory(directory);

  const connectorFactories = await Promise.all(
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

        return {
          metadata: rawConnector.metadata,
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

export const getLogtoConnectors = async (): Promise<LogtoConnector[]> => {
  const databaseConnectors = await findAllConnectors();

  const logtoConnectors = await Promise.all(
    databaseConnectors.map(async (databaseConnector) => {
      const { id, metadata, connectorId } = databaseConnector;

      const connectorFactories = await loadConnectorFactories();
      const connectorFactory = connectorFactories.find(
        ({ metadata }) => metadata.id === connectorId
      );

      if (!connectorFactory) {
        return;
      }

      const { createConnector, path: packagePath } = connectorFactory;

      try {
        const rawConnector = await createConnector({
          getConfig: async () => {
            return getConnectorConfig(id);
          },
        });
        validateConnectorModule(rawConnector);

        const connector: AllConnector = {
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
            ...metadata,
          },
        };

        return {
          ...connector,
          validateConfig: (config: unknown) => {
            validateConfig(config, rawConnector.configGuard);
          },
          dbEntry: databaseConnector,
        };
      } catch {}
    })
  );

  return logtoConnectors.filter(
    (logtoConnector): logtoConnector is LogtoConnector => logtoConnector !== undefined
  );
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
  const existingConnectors = new Map(
    connectors.map((connector) => [connector.connectorId, connector])
  );
  const allConnectors = await loadConnectorFactories();
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
