import type { ZodType, ZodTypeDef } from 'zod';

import { ConnectorError, ConnectorErrorCodes } from './types/index.js';

export * from './types/index.js';

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

const isRecordOrArray = (parsed: unknown): parsed is Record<string, unknown> | unknown[] => {
  if (Array.isArray(parsed)) {
    return true;
  }

  if (!(parsed !== null && typeof parsed === 'object')) {
    return false;
  }

  if (Object.getOwnPropertySymbols(parsed).length > 0) {
    return false;
  }

  return true;
};

export const parseJsonObject = (...args: Parameters<typeof parseJson>) => {
  const parsed = parseJson(...args);

  if (!isRecordOrArray(parsed)) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, parsed);
  }

  return parsed;
};

export const mockSmsVerificationCodeFileName = 'logto_mock_verification_code_record.txt';
