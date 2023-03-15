import { buildRawConnector, defaultConnectorMethods } from '@logto/cli/lib/connector/index.js';
import type { AllConnector, EmailConnector, SendMessagePayload } from '@logto/connector-kit';
import { ConnectorType, validateConfig } from '@logto/connector-kit';
import { adminTenantId } from '@logto/schemas';
import { trySafe } from '@logto/shared';
import { RequestError } from '@withtyped/server';

import type { Queries } from '#src/queries/index.js';
import type { LogtoConnector } from '#src/utils/connector/index.js';
import { loadConnectorFactories } from '#src/utils/connector/index.js';

export class ServicesLibrary {
  constructor(public readonly queries: Queries) {}

  async getTenantIdFromApplicationId(applicationId: string) {
    const application = await this.queries.applications.findApplicationById(
      applicationId,
      adminTenantId
    );

    return application.customClientMetadata.tenantId;
  }

  async getAdminTenantLogtoConnectors(): Promise<LogtoConnector[]> {
    const databaseConnectors = await this.queries.connectors.findAllConnectors(adminTenantId);

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

        return trySafe(async () => {
          const { rawConnector, rawMetadata } = await buildRawConnector(
            connectorFactory,
            async () => {
              const databaseConnectors = await this.queries.connectors.findAllConnectors(
                adminTenantId
              );
              const connector = databaseConnectors.find((connector) => connector.id === id);

              if (!connector) {
                throw new RequestError(`Unable to find connector ${id}`, 500);
              }

              return connector.config;
            }
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
        });
      })
    );

    return logtoConnectors.filter(
      (logtoConnector): logtoConnector is LogtoConnector => logtoConnector !== undefined
    );
  }

  async sendEmail(data: SendMessagePayload) {
    const connectors = await this.getAdminTenantLogtoConnectors();

    const connector = connectors.find(
      (connector): connector is LogtoConnector<EmailConnector> =>
        connector.type === ConnectorType.Email
    );

    if (!connector) {
      throw new RequestError('Unable to find email connector', 500);
    }

    const { sendMessage } = connector;

    return sendMessage(data);
  }
}
