import type { AllConnector } from '@logto/connector-kit';
import { validateConfig } from '@logto/connector-kit';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { defaultConnectorMethods } from '#src/utils/connectors/consts.js';
import { loadConnectorFactories } from '#src/utils/connectors/factories.js';
import { buildRawConnector } from '#src/utils/connectors/index.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

export type ConnectorLibrary = ReturnType<typeof createConnectorLibrary>;

export const createConnectorLibrary = (queries: Queries) => {
  const { findAllConnectors } = queries.connectors;

  const getConnectorConfig = async (id: string): Promise<unknown> => {
    const connectors = await findAllConnectors();
    const connector = connectors.find((connector) => connector.id === id);

    assertThat(connector, new RequestError({ code: 'entity.not_found', id, status: 404 }));

    return connector.config;
  };

  const getLogtoConnectors = async (): Promise<LogtoConnector[]> => {
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

        try {
          const { rawConnector, rawMetadata } = await buildRawConnector(
            connectorFactory,
            async () => getConnectorConfig(id)
          );

          const connector: AllConnector = {
            ...defaultConnectorMethods,
            ...rawConnector,
            metadata: {
              ...rawMetadata,
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

  const getLogtoConnectorById = async (id: string): Promise<LogtoConnector> => {
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

  return { getConnectorConfig, getLogtoConnectors, getLogtoConnectorById };
};
