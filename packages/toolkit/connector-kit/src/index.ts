import type { ZodType, ZodTypeDef } from 'zod';

import { ConnectorError, ConnectorErrorCodes } from './types.js';

export * from './types.js';

export function validateConfig<T>(config: unknown, guard: ZodType): asserts config is T {
  const result = guard.safeParse(config);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, { zodError: result.error });
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
    throw new ConnectorError(errorCode, { data: errorPayload ?? jsonString });
  }
};

export const parseJsonObject = (...args: Parameters<typeof parseJson>) => {
  const parsed = parseJson(...args);

  if (!(parsed !== null && typeof parsed === 'object')) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, { data: parsed });
  }

  return parsed;
};

export const connectorDataParser = <T = unknown, U = T>(
  data: unknown,
  guard: ZodType<T, ZodTypeDef, U>,
  errorCode: ConnectorErrorCodes = ConnectorErrorCodes.InvalidResponse
): T => {
  const result = guard.safeParse(data);
  if (!result.success) {
    throw new ConnectorError(errorCode, { zodError: result.error, data });
  }

  return result.data;
};

export const mockSmsVerificationCodeFileName = 'logto_mock_verification_code_record.txt';
