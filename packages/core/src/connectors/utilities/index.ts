import { ArbitraryObject, ConnectorPlatform } from '@logto/schemas';

import { findConnectorByTargetAndPlatform, updateConnector } from '@/queries/connector';

export const buildIndexWithTargetAndPlatform = (
  target: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  platform: string | null
): string => [target, platform ?? 'null'].join('_');

export const getConnectorConfig = async <T extends ArbitraryObject>(
  target: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  platform: ConnectorPlatform | null
): Promise<T> => {
  const connector = await findConnectorByTargetAndPlatform(target, platform);

  return connector.config as T;
};

export const updateConnectorConfig = async <T extends ArbitraryObject>(
  where: {
    target: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    platform: ConnectorPlatform | null;
  },
  config: T
): Promise<void> => {
  await updateConnector({
    where,
    set: { config },
  });
};
