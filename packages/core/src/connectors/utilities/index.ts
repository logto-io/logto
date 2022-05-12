import { ArbitraryObject, ConnectorPlatform } from '@logto/schemas';
import { Nullable } from '@silverhand/essentials';

import RequestError from '@/errors/RequestError';
import { findAllConnectors } from '@/queries/connector';

export const buildIndexWithTargetAndPlatform = (
  target: string,
  platform: Nullable<string>
): string => [target, platform ?? 'null'].join('_');

export const getConnectorConfig = async <T extends ArbitraryObject>(
  target: string,
  platform: Nullable<ConnectorPlatform>
): Promise<T> => {
  const connectors = await findAllConnectors();
  const connector = connectors.find(
    (connector) => connector.target === target && connector.platform === platform
  );

  if (!connector) {
    throw new RequestError({ code: 'entity.not_found', target, platform, status: 404 });
  }

  return connector.config as T;
};
