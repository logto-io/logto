import { ArbitraryObject, ConnectorPlatform } from '@logto/schemas';
import { Nullable } from '@silverhand/essentials';

import { findConnectorByTargetAndPlatform, updateConnector } from '@/queries/connector';

export const buildIndexWithTargetAndPlatform = (
  target: string,
  platform: Nullable<string>
): string => [target, platform ?? 'null'].join('_');

export const getConnectorConfig = async <T extends ArbitraryObject>(
  target: string,
  platform: Nullable<ConnectorPlatform>
): Promise<T> => {
  const connector = await findConnectorByTargetAndPlatform(target, platform);

  return connector.config as T;
};

export const updateConnectorConfig = async <T extends ArbitraryObject>(
  where: {
    target: string;
    platform: Nullable<ConnectorPlatform>;
  },
  config: T
): Promise<void> => {
  await updateConnector({
    where,
    set: { config },
  });
};
