import type { ZodType, ZodTypeDef } from 'zod';

import { ConnectorError, ConnectorErrorCodes } from './types/index.js';

export * from './types/index.js';
export * from './utils/oidc.js';

export function validateConfig<Output, Input = Output>(
  config: unknown,
  guard: ZodType<Output, ZodTypeDef, Input>
): asserts config is Output {
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
