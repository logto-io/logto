import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';

import { connectorDirectory } from '@logto/cli/lib/constants';
import { AllConnector, CreateConnector, validateConfig } from '@logto/connector-kit';
import chalk from 'chalk';

import RequestError from '@/errors/RequestError';
import { findAllConnectors, insertConnector } from '@/queries/connector';

import { defaultConnectorMethods } from './consts';
import { LoadConnector, LogtoConnector } from './types';
import { getConnectorConfig, readUrl, validateConnectorModule } from './utilities';

// eslint-disable-next-line @silverhand/fp/no-let
let cachedConnectors: LoadConnector[] | undefined;

const loadConnectors = async () => {
  if (cachedConnectors) {
    return cachedConnectors;
  }

  if (!existsSync(connectorDirectory)) {
    return [];
  }

  const connectorFolders = await readdir(connectorDirectory);

  const connectors = await Promise.all(
    connectorFolders.map(async (folder) => {
      try {
        const packagePath = path.join(connectorDirectory, folder);
        // eslint-disable-next-line no-restricted-syntax
        const { default: createConnector } = (await import(packagePath)) as {
          default: CreateConnector<AllConnector>;
        };
        const rawConnector = await createConnector({ getConfig: getConnectorConfig });
        validateConnectorModule(rawConnector);

        const connector: LoadConnector = {
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
              `[load-connector] skip ${chalk.bold(folder)} due to error: ${error.message}`
            )}`
          );

          return;
        }

        throw error;
      }
    })
  );

  // eslint-disable-next-line @silverhand/fp/no-mutation
  cachedConnectors = connectors.filter(
    (connector): connector is LoadConnector => connector !== undefined
  );

  return cachedConnectors;
};

export const getLogtoConnectors = async (): Promise<LogtoConnector[]> => {
  const connectors = await findAllConnectors();
  const connectorMap = new Map(connectors.map((connector) => [connector.id, connector]));

  const logtoConnectors = await loadConnectors();

  return logtoConnectors.map((element) => {
    const { id } = element.metadata;
    const connector = connectorMap.get(id);

    if (!connector) {
      throw new RequestError({ code: 'entity.not_found', id, status: 404 });
    }

    return {
      ...element,
      dbEntry: connector,
    };
  });
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
  const allConnectors = await loadConnectors();
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
      });
    })
  );
};
