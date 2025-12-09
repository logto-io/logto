import { buildRawConnector, defaultConnectorMethods } from '@logto/cli/lib/connector/index.js';
import type {
  AllConnector,
  ConnectorPlatform,
  EmailConnector,
  GetI18nEmailTemplate,
  SmsConnector,
} from '@logto/connector-kit';
import {
  validateConfig,
  ServiceConnector,
  ConnectorType,
  TemplateType,
} from '@logto/connector-kit';
import { type Nullable, conditional, pick, trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { loadConnectorFactories } from '#src/utils/connectors/index.js';
import type { LogtoConnector, LogtoConnectorWellKnown } from '#src/utils/connectors/types.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';

export type ConnectorLibrary = ReturnType<typeof createConnectorLibrary>;

export const createConnectorLibrary = (
  queries: Queries,
  cloudConnection: Pick<CloudConnectionLibrary, 'getClient'>
) => {
  const { findAllConnectors, findAllConnectorsWellKnown } = queries.connectors;
  const { getClient } = cloudConnection;

  const getConnectorConfig = async (id: string): Promise<unknown> => {
    const connectors = await findAllConnectors();
    const connector = connectors.find((connector) => connector.id === id);

    assertThat(connector, new RequestError({ code: 'entity.not_found', id, status: 404 }));

    return connector.config;
  };

  const getLogtoConnectorsWellKnown = async (): Promise<LogtoConnectorWellKnown[]> => {
    const databaseConnectors = await findAllConnectorsWellKnown();
    const connectorFactories = await loadConnectorFactories();

    const logtoConnectors = await Promise.all(
      databaseConnectors.map(async (databaseEntry) => {
        const { metadata, connectorId } = databaseEntry;
        const connectorFactory = connectorFactories.find(
          ({ metadata }) => metadata.id === connectorId
        );

        if (!connectorFactory) {
          return;
        }

        return trySafe(async () => {
          const { rawConnector, rawMetadata } = await buildRawConnector(connectorFactory);

          return {
            ...pick(rawConnector, 'type', 'metadata'),
            metadata: { ...rawMetadata, ...metadata },
            dbEntry: databaseEntry,
          };
        });
      })
    );

    return logtoConnectors.filter(Boolean);
  };

  const getLogtoConnectors = async (): Promise<LogtoConnector[]> => {
    const databaseConnectors = await findAllConnectors();
    const connectorFactories = await loadConnectorFactories();

    const logtoConnectors = await Promise.all(
      databaseConnectors.map(async (databaseConnector) => {
        const { id, metadata, connectorId } = databaseConnector;
        const connectorFactory = connectorFactories.find(
          ({ metadata }) => metadata.id === connectorId
        );

        if (!connectorFactory) {
          return;
        }

        try {
          const { rawConnector, rawMetadata } = await buildRawConnector(
            connectorFactory,
            async () => getConnectorConfig(id),
            conditional(connectorFactory.metadata.id === ServiceConnector.Email && getClient),
            conditional(connectorFactory.type === ConnectorType.Email && getI18nEmailTemplate)
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

    return logtoConnectors.filter(Boolean);
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

  const getLogtoConnectorByTargetAndPlatform = async (
    target: string,
    platform: Nullable<ConnectorPlatform>
  ) => {
    const connectors = await getLogtoConnectors();

    return connectors.find(({ type, metadata }) => {
      return (
        type === ConnectorType.Social &&
        metadata.target === target &&
        metadata.platform === platform
      );
    });
  };

  /** Type of the connector that can send message of the given type. */
  type MappedConnectorType = {
    [ConnectorType.Email]: LogtoConnector<EmailConnector>;
    [ConnectorType.Sms]: LogtoConnector<SmsConnector>;
  };

  const getMessageConnector = async <Type extends keyof MappedConnectorType>(
    type: Type
  ): Promise<MappedConnectorType[Type]> => {
    const connectors = await getLogtoConnectors();
    const connector = connectors.find(
      (connector): connector is MappedConnectorType[Type] => connector.type === type
    );
    assertThat(
      connector,
      // TODO: @gao refactor RequestError and ServerError to share the same base class
      new RequestError({
        code: 'connector.not_found',
        type,
        status: 501,
      })
    );
    return connector;
  };

  const getI18nEmailTemplate: GetI18nEmailTemplate = async (templateType, languageTag) => {
    const { signInExperiences, emailTemplates } = queries;

    // If the language tag is provided, try to get the template with the language tag.
    if (languageTag) {
      const template = await emailTemplates.findByLanguageTagAndTemplateType(
        templateType,
        languageTag
      );

      if (template) {
        return template.details;
      }
    }

    const {
      languageInfo: { fallbackLanguage },
    } = await signInExperiences.findDefaultSignInExperience();

    // If the language tag is not provided or the template with the language tag is not available,
    // fallback to the template with the fallback language.
    const fallbackTemplate = await emailTemplates.findByLanguageTagAndTemplateType(
      templateType,
      fallbackLanguage
    );

    if (fallbackTemplate) {
      return fallbackTemplate.details;
    }

    // If the fallback template is also not available, finally fallback to the generic template type.
    const genericTemplate = await emailTemplates.findByLanguageTagAndTemplateType(
      TemplateType.Generic,
      fallbackLanguage
    );

    return genericTemplate?.details;
  };

  return {
    getConnectorConfig,
    getLogtoConnectors,
    getLogtoConnectorsWellKnown,
    getLogtoConnectorById,
    getLogtoConnectorByTargetAndPlatform,
    /**
     * Get the connector that can send message of the given type.
     *
     * @param type The type of the connector to get.
     * @returns The connector that can send message of the given type.
     * @throws {RequestError} If no connector can send message of the given type (status 500).
     */
    getMessageConnector,
    getI18nEmailTemplate,
  };
};
