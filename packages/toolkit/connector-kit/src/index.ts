import { type Json, type JsonObject } from '@withtyped/server';
import type { ZodType, ZodTypeDef } from 'zod';

import {
  ConnectorError,
  ConnectorErrorCodes,
  type SendMessagePayload,
  ConnectorType,
  jsonGuard,
  jsonObjectGuard,
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
): Json => {
  try {
    return jsonGuard.parse(JSON.parse(jsonString));
  } catch {
    throw new ConnectorError(errorCode, errorPayload ?? jsonString);
  }
};

export const parseJsonObject = (
  ...[jsonString, errorCode = ConnectorErrorCodes.InvalidResponse, errorPayload]: Parameters<
    typeof parseJson
  >
): JsonObject => {
  try {
    return jsonObjectGuard.parse(JSON.parse(jsonString));
  } catch {
    throw new ConnectorError(errorCode, errorPayload ?? jsonString);
  }
};

/** @deprecated Use {@link mockConnectorFilePaths} instead. */
export const mockSmsVerificationCodeFileName = 'logto_mock_verification_code_record.txt';

/**
 * The file paths for storing the mock sms/email connector records. You can use these file paths to
 * read the records for testing.
 */
export const mockConnectorFilePaths = Object.freeze({
  [ConnectorType.Sms]: '/tmp/logto_mock_sms_record.txt',
  [ConnectorType.Email]: '/tmp/logto_mock_email_record.txt',
});

/**
 * Replace all handlebars that match the keys in {@link SendMessagePayload} with the payload
 * values.
 *
 * - If the payload does not contain the root property, the handlebars will not be replaced.
 * - If the payload contains the root property but does not contain the nested property,
 *  the handlebars will be replaced with an empty string.
 *
 * @param template The template to replace the handlebars with.
 * @param payload The payload to replace the handlebars with.
 * @returns The replaced template.
 *
 * @example
 * ```ts
 * replaceSendMessageKeysWithPayload('Your verification code is {{code}}', { code: '123456' });
 * // 'Your verification code is 123456'
 *
 * replaceSendMessageKeysWithPayload('Your application name is {{application.name}}', { application: { name: 'Logto' } });
 * // 'Your application name is Logto'
 *
 * replaceSendMessageKeysWithPayload('Your application name is {{application.name}}', { application: {}});
 * // 'Your application name is '
 * ```
 *
 * @example
 * ```ts
 * replaceSendMessageKeysWithPayload('Your verification code is {{code}}', {});
 * // 'Your verification code is {{code}}'
 *
 * replaceSendMessageKeysWithPayload('Your application name is {{application.name}}', {});
 * // 'Your application name is {{application.name}}'
 * ```
 */
export const replaceSendMessageHandlebars = (
  template: string,
  payload: SendMessagePayload
): string => {
  const regex = /{{\s*([\w.]+)\s*}}/g;

  return template.replaceAll(regex, (handleBar, key: string) => {
    const baseKey = key.split('.')[0];
    // If the root variable does not exist in the payload, return the original key
    if (!(baseKey && baseKey in payload)) {
      return handleBar;
    }

    const value = getValue(payload, key);

    return String(value ?? '');
  });
};

export const getValue = (object: Record<string, unknown>, path: string): unknown | undefined => {
  return path.split('.').reduce<unknown | undefined>((current, part) => {
    // Return undefined if the current value is not an object
    if (!current || typeof current !== 'object') {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax
    return (current as Record<string, unknown>)[part];
  }, object);
};
