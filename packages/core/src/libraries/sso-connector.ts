import { assert } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { type SupportedSsoConnector } from '#src/sso/types/index.js';
import { isSupportedSsoConnector } from '#src/sso/utils.js';
import type Queries from '#src/tenants/Queries.js';

export type SsoConnectorLibrary = ReturnType<typeof createSsoConnectorLibrary>;

export const createSsoConnectorLibrary = (queries: Queries) => {
  const { ssoConnectors } = queries;

  const getSsoConnectors = async () => {
    const [_, entities] = await ssoConnectors.findAll();

    return entities.filter((connector): connector is SupportedSsoConnector =>
      isSupportedSsoConnector(connector)
    );
  };

  const getAvailableSsoConnectors = async () => {
    const connectors = await getSsoConnectors();

    return connectors.filter(({ providerName, config, domains }) => {
      const factory = ssoConnectorFactories[providerName];
      const hasValidConfig = factory.configGuard.safeParse(config).success;
      const hasValidDomains = domains.length > 0;

      return hasValidConfig && hasValidDomains;
    });
  };

  const getSsoConnectorById = async (id: string) => {
    const connector = await ssoConnectors.findById(id);

    // Return 404 if the connector is not supported
    assert(
      isSupportedSsoConnector(connector),
      new RequestError({
        code: 'connector.not_found',
        status: 404,
      })
    );

    return connector;
  };

  return {
    getSsoConnectors,
    getAvailableSsoConnectors,
    getSsoConnectorById,
  };
};
