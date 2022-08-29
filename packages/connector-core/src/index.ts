import { ZodType } from 'zod';

import { ConnectorError, ConnectorErrorCodes } from './types';

export * from './types';

export function validateConfig<T>(config: unknown, guard: ZodType): asserts config is T {
  const result = guard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
  }
}
