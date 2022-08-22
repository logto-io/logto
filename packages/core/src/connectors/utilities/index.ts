import { ConnectorError, ConnectorErrorCodes, GeneralConnector } from '@logto/connector-core';

import RequestError from '@/errors/RequestError';
import { findAllConnectors } from '@/queries/connector';
import assertThat from '@/utils/assert-that';

export const getConnectorConfig = async (id: string): Promise<unknown> => {
  const connectors = await findAllConnectors();
  const connector = connectors.find((connector) => connector.id === id);

  assertThat(connector, new RequestError({ code: 'entity.not_found', id, status: 404 }));

  return connector.config;
};

export function validateConnectorModule(
  connector: Partial<GeneralConnector>
): asserts connector is GeneralConnector {
  if (!connector.metadata) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidMetadata);
  }

  if (!connector.configGuard) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfigGuard);
  }
}
