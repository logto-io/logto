import { ArbitraryObject } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import { findAllConnectors } from '@/queries/connector';
import assertThat from '@/utils/assert-that';

export const getConnectorConfig = async <T extends ArbitraryObject>(id: string): Promise<T> => {
  const connectors = await findAllConnectors();
  const connector = connectors.find((connector) => connector.id === id);

  assertThat(connector, new RequestError({ code: 'entity.not_found', id, status: 404 }));

  return connector.config as T;
};
