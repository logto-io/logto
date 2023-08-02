import type { ZodType } from 'zod';

import { ConnectorError, ConnectorErrorCodes } from './types.js';

export * from './types.js';

export function validateConfig<T>(config: unknown, guard: ZodType): asserts config is T {
  const result = guard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
  }
}

export const parseJson = (
  jsonString: string,
  errorCode: ConnectorErrorCodes = ConnectorErrorCodes.InvalidResponse,
  errorPayload?: unknown
): unknown => {
  try {
    return JSON.parse(jsonString);
  } catch {
    throw new ConnectorError(errorCode, errorPayload ?? jsonString);
  }
};

export const parseJsonObject = (...args: Parameters<typeof parseJson>) => {
  const parsed = parseJson(...args);

  if (!(parsed !== null && typeof parsed === 'object')) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, parsed);
  }

  return parsed;
};

export const mockSmsVerificationCodeFileName = 'logto_mock_verification_code_record.txt';
