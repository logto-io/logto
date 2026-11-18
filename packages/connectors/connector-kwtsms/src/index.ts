// 2026-11-16 02:10 +03: kwtSMS SMS connector for Logto (task: integration kwtsms_logto)
import { assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  SmsConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  replaceSendMessageHandlebars,
  getConfigTemplateByType,
} from '@logto/connector-kit';

import { defaultMetadata, endpoint } from './constant.js';
import type { PublicParameters } from './types.js';
import { kwtSmsConfigGuard, kwtSmsErrorGuard, kwtSmsSuccessGuard } from './types.js';

/**
 * The kwtSMS API wants digits only: Arabic-Indic and Persian digits become Latin, then every
 * non-digit (+, spaces, dashes, brackets) is dropped and a leading `00` is removed.
 */
export const normalizeMobile = (phoneNumber: string) =>
  phoneNumber
    .replaceAll(/[٠-٩]/g, (digit) => String((digit.codePointAt(0) ?? 0x06_60) - 0x06_60))
    .replaceAll(/[۰-۹]/g, (digit) => String((digit.codePointAt(0) ?? 0x06_f0) - 0x06_f0))
    .replaceAll(/\D/g, '')
    .replace(/^00/, '');

/** The kwtSMS API rejects emoji, and zero-width characters inflate the segment count: drop both. */
const cleanMessage = (message: string) =>
  message.replaceAll(/[\p{Extended_Pictographic}\u200B-\u200D\u2060\uFEFF]/gu, '');

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, kwtSmsConfigGuard);
    const { username, password, senderId, testMode } = kwtSmsConfigGuard.parse(config);
    const template = getConfigTemplateByType(type, config);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    const parameters: PublicParameters = {
      username,
      password,
      sender: senderId,
      mobile: normalizeMobile(to),
      message: cleanMessage(replaceSendMessageHandlebars(template.content, payload)),
      test: testMode ? '1' : '0',
    };

    const toError = (body: unknown) => {
      const error = kwtSmsErrorGuard.safeParse(body);

      return error.success
        ? new ConnectorError(
            ConnectorErrorCodes.General,
            `${error.data.code}: ${error.data.description ?? 'Unknown error'}`
          )
        : new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(body));
    };

    try {
      const body: unknown = await got
        .post(endpoint, { json: parameters, headers: { Accept: 'application/json' } })
        .json();

      // The gateway answers errors with HTTP 4XX, but never trust a 200 without `result: OK`.
      if (!kwtSmsSuccessGuard.safeParse(body).success) {
        throw toError(body);
      }

      return body;
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { body: rawBody } = error.response;
        assert(
          typeof rawBody === 'string',
          new ConnectorError(
            ConnectorErrorCodes.InvalidResponse,
            `Invalid response raw body type: ${typeof rawBody}`
          )
        );

        try {
          throw toError(JSON.parse(rawBody));
        } catch (parseError: unknown) {
          if (parseError instanceof ConnectorError) {
            throw parseError;
          }

          throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, rawBody);
        }
      }

      throw error;
    }
  };

const createKwtSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: kwtSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createKwtSmsConnector;
