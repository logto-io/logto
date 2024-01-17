import type { ZodType, ZodTypeDef } from 'zod';

import {
  ConnectorError,
  ConnectorErrorCodes,
  sendMessagePayloadKeys,
  type SendMessagePayload,
} from './types/index.js';

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

export const parseJsonObject = (...args: Parameters<typeof parseJson>) => {
  const parsed = parseJson(...args);

  if (!(parsed !== null && typeof parsed === 'object')) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, parsed);
  }

  return parsed;
};

export const mockSmsVerificationCodeFileName = 'logto_mock_verification_code_record.txt';

/**
 * Replace all handlebars that match the keys in {@link SendMessagePayload} with the payload
 * values. If the payload does not contain the key, the handlebar will be replaced with an empty
 * string.
 *
 * @param template The template to replace the handlebars with.
 * @param payload The payload to replace the handlebars with.
 * @returns The replaced template.
 *
 * @example
 * ```ts
 * replaceSendMessageKeysWithPayload('Your verification code is {{code}}', { code: '123456' });
 * // 'Your verification code is 123456'
 * ```
 *
 * @example
 * ```ts
 * replaceSendMessageKeysWithPayload('Your verification code is {{code}}', {});
 * // 'Your verification code is '
 * ```
 */
export const replaceSendMessageHandlebars = (
  template: string,
  payload: SendMessagePayload
): string => {
  return sendMessagePayloadKeys.reduce(
    (accumulator, key) =>
      accumulator.replaceAll(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), payload[key] ?? ''),
    template
  );
};
