import { assert } from '@silverhand/essentials';
import { got, HTTPError, ParseError, RequestError } from 'got';

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

import { defaultMetadata, defaultTimeout, endpoint } from './constant.js';
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

/**
 * The kwtSMS API rejects emoji, and zero-width characters inflate the segment count: drop both.
 * Whole sequences go: keycaps (digit + U+FE0F + U+20E3), flags (regional indicators), tag
 * sequences, skin tones and variation selectors, so no half-emoji is left in the message.
 */
const cleanMessage = (message: string) =>
  message.replaceAll(
    /[\d#*]\uFE0F?\u20E3|[\p{Extended_Pictographic}\p{Regional_Indicator}\u{E0020}-\u{E007F}\u200B\u200C\u2060\uFEFF]|[\u{1F3FB}-\u{1F3FF}]|\u200D|\u20E3|\uFE0E|\uFE0F/gu,
    ''
  );

const toError = (body: unknown) => {
  const error = kwtSmsErrorGuard.safeParse(body);

  return error.success
    ? new ConnectorError(
        ConnectorErrorCodes.General,
        `${error.data.code}: ${error.data.description ?? 'Unknown error'}`
      )
    : new ConnectorError(ConnectorErrorCodes.InvalidResponse, JSON.stringify(body));
};

/** Maps any failure of the send request to a ConnectorError. */
const toConnectorError = (error: unknown): ConnectorError => {
  if (error instanceof ConnectorError) {
    return error;
  }

  if (error instanceof HTTPError) {
    const { body: rawBody } = error.response;

    if (typeof rawBody !== 'string') {
      return new ConnectorError(
        ConnectorErrorCodes.InvalidResponse,
        `Invalid response raw body type: ${typeof rawBody}`
      );
    }

    try {
      return toError(JSON.parse(rawBody));
    } catch {
      return new ConnectorError(ConnectorErrorCodes.InvalidResponse, rawBody);
    }
  }

  // A 200 with a non-JSON body (e.g. a proxy or WAF page).
  if (error instanceof ParseError) {
    return new ConnectorError(ConnectorErrorCodes.InvalidResponse, String(error.response.body));
  }

  if (error instanceof RequestError) {
    return new ConnectorError(
      ConnectorErrorCodes.General,
      `kwtSMS request failed: ${error.message}`
    );
  }

  return new ConnectorError(
    ConnectorErrorCodes.General,
    error instanceof Error ? error.message : String(error)
  );
};

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

    try {
      const body: unknown = await got
        .post(endpoint, {
          json: parameters,
          headers: { Accept: 'application/json' },
          retry: { limit: 0 },
          timeout: { request: defaultTimeout },
        })
        .json();

      // The gateway answers errors with HTTP 4XX, but never trust a 200 without `result: OK`.
      if (!kwtSmsSuccessGuard.safeParse(body).success) {
        throw toError(body);
      }

      return body;
    } catch (error: unknown) {
      throw toConnectorError(error);
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
