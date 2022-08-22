import { ZodType } from 'zod';

import { ConnectorError, ConnectorErrorCodes, GetConnectorConfig } from './types';

export * from './types';

// eslint-disable-next-line @silverhand/fp/no-let
let _getConfig: GetConnectorConfig = async () => {
  throw new Error('Not implemented');
};

export const implementGetConfig = (getConfig: GetConnectorConfig) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  _getConfig = getConfig;
};

export function validateConfig<T>(config: unknown, guard: ZodType): asserts config is T {
  const result = guard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
  }
}

export const getAndValidateConfig = async <T>(id: string, guard: ZodType): Promise<T> => {
  const config = await _getConfig(id);
  validateConfig<T>(config, guard);

  return config;
};
