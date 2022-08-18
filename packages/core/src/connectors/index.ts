import { existsSync, readFileSync } from 'fs';
import path from 'path';

import { GetConnectorConfig } from '@logto/connector-schemas';
import { Connector } from '@logto/schemas/lib/db-entries';
import resolvePackagePath from 'resolve-package-path';

import envSet from '@/env-set';
import RequestError from '@/errors/RequestError';
import { findAllConnectors, insertConnector } from '@/queries/connector';

import { defaultConnectorPackages } from './consts';
import { ConnectorInstance, SocialConnectorInstance, ConnectorType } from './types';
import { getConnectorConfig } from './utilities';

// eslint-disable-next-line @silverhand/fp/no-let
let cachedConnectorInstances: ConnectorInstance[] | undefined;

export const getConnectorInstances = async (): Promise<ConnectorInstance[]> => {
  const connectors = await findAllConnectors();
  const connectorMap = new Map(connectors.map((connector) => [connector.id, connector]));

  if (cachedConnectorInstances) {
    return cachedConnectorInstances.map((connectorInstance) => {
      const { id } = connectorInstance.metadata;
      const connector = connectorMap.get(id);

      if (!connector) {
        throw new RequestError({ code: 'entity.not_found', id, status: 404 });
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation
      connectorInstance.connector = connector;

      return connectorInstance;
    });
  }
  const {
    values: { additionalConnectorPackages },
  } = envSet;

  const connectorPackages = [...defaultConnectorPackages, ...additionalConnectorPackages];

  // eslint-disable-next-line @silverhand/fp/no-mutation
  cachedConnectorInstances = await Promise.all(
    connectorPackages.map(async (packageName) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { default: Builder, defaultMetadata: metadata } = await import(packageName);
      class InstanceBuilder extends Builder {
        public connector: Connector;

        constructor(getConnectorConfig: GetConnectorConfig, connector: Connector) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          super(getConnectorConfig);
          this.connector = connector;
        }
      }
      const connector = connectorMap.get(metadata.id);

      if (!connector) {
        throw new RequestError({ code: 'entity.not_found', id: metadata.id, status: 404 });
      }

      // eslint-disable-next-line no-restricted-syntax
      const instance: ConnectorInstance = new InstanceBuilder(
        getConnectorConfig,
        connector
      ) as ConnectorInstance;
      // eslint-disable-next-line unicorn/prefer-module
      const packagePath = resolvePackagePath(packageName, __dirname);

      // For relative path logo url, try to read local asset.
      if (
        packagePath &&
        !instance.metadata.logo.startsWith('http') &&
        existsSync(path.join(packagePath, '..', instance.metadata.logo))
      ) {
        const data = readFileSync(path.join(packagePath, '..', instance.metadata.logo));
        // eslint-disable-next-line @silverhand/fp/no-mutation
        instance.metadata.logo = `data:image/svg+xml;base64,${data.toString('base64')}`;
      }

      if (
        packagePath &&
        instance.metadata.logoDark &&
        !instance.metadata.logoDark.startsWith('http') &&
        existsSync(path.join(packagePath, '..', instance.metadata.logoDark))
      ) {
        const data = readFileSync(path.join(packagePath, '..', instance.metadata.logoDark));
        // eslint-disable-next-line @silverhand/fp/no-mutation
        instance.metadata.logoDark = `data:image/svg+xml;base64,${data.toString('base64')}`;
      }

      if (
        packagePath &&
        instance.metadata.readme &&
        existsSync(path.join(packagePath, '..', instance.metadata.readme))
      ) {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        instance.metadata.readme = readFileSync(
          path.join(packagePath, '..', instance.metadata.readme),
          'utf8'
        );
      }

      if (
        packagePath &&
        instance.metadata.configTemplate &&
        existsSync(path.join(packagePath, '..', instance.metadata.configTemplate))
      ) {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        instance.metadata.configTemplate = readFileSync(
          path.join(packagePath, '..', instance.metadata.configTemplate),
          'utf8'
        );
      }

      return instance;
    })
  );

  return cachedConnectorInstances;
};

// Export const getConnectorInstances = async (): Promise<ConnectorInstance[]> => {
//   const connectors = await findAllConnectors();
//   const connectorMap = new Map(connectors.map((connector) => [connector.id, connector]));

//   const allConnectors = await loadConnectors();

//   return allConnectors.map((element) => {
//     const { id } = element.metadata;
//     const connector = connectorMap.get(id);

//     if (!connector) {
//       throw new RequestError({ code: 'entity.not_found', id, status: 404 });
//     }

//     // eslint-disable-next-line @silverhand/fp/no-mutation
//     element.connector = connector;

//     return element;
//   });
// };

export const getConnectorInstanceById = async (id: string): Promise<ConnectorInstance> => {
  const connectorInstances = await getConnectorInstances();
  const pickedConnectorInstance = connectorInstances.find(({ connector }) => connector.id === id);

  if (!pickedConnectorInstance) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  return pickedConnectorInstance;
};

const isSocialConnectorInstance = (
  connector: ConnectorInstance
): connector is SocialConnectorInstance => {
  return connector.metadata.type === ConnectorType.Social;
};

export const getSocialConnectorInstanceById = async (
  id: string
): Promise<SocialConnectorInstance> => {
  const connector = await getConnectorInstanceById(id);

  if (!isSocialConnectorInstance(connector)) {
    throw new RequestError({
      code: 'entity.not_found',
      id,
      status: 404,
    });
  }

  return connector;
};

export const initConnectors = async () => {
  const connectors = await findAllConnectors();
  const existingConnectors = new Map(connectors.map((connector) => [connector.id, connector]));
  const allConnectorInstances = await getConnectorInstances();
  const newConnectors = allConnectorInstances.filter(({ metadata: { id } }) => {
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
