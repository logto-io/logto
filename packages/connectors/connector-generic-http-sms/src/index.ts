import { assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import {
  type GetConnectorConfig,
  type SendMessageFunction,
  type CreateConnector,
  type SmsConnector,
  replaceSendMessageHandlebars,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { httpSmsConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, httpSmsConfigGuard);
    const { method, endpoint, authorization, queryParams, bodyParams, headers, templates } = config;
    const template = templates.find((t) => t.usageType === type);

    if (!template) {
      throw new Error(`Cannot find template for type: ${type}`);
    }

    const replacements = {
      to,
      message: replaceSendMessageHandlebars(template.content, payload),
    };
    console.log(replacements);
    try {
      if (method.toUpperCase() === 'GET') {
        console.log('Implementing GET request');
        return await got.get(endpoint, {
          searchParams: replacePlaceholdersSimple(queryParams, replacements),
          headers: {
            ...(authorization && { Authorization: authorization }),
            'Content-Type': 'application/json',
            ...(headers ?? {}),
          },
        });
      }
      if (method.toUpperCase() === 'POST') {
        return await got.post(endpoint, {
          headers: {
            ...(authorization && { Authorization: authorization }),
            'Content-Type': 'application/json',
            ...(headers ?? {}),
          },
          json: replacePlaceholdersSimple(bodyParams, replacements),
        });
      }
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody },
        } = error;
        assert(
          typeof rawBody === 'string',
          new ConnectorError(
            ConnectorErrorCodes.InvalidResponse,
            `Invalid response raw body type: ${typeof rawBody}`
          )
        );

        throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
      }

      throw error;
    }
  };

const createHttpSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: httpSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

function replacePlaceholdersSimple<T>(object: T, replacements: Record<string, string>): T {
  const replaceValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return Object.entries(replacements).reduce(
        (accumulator, [key, rep]) => accumulator.replace(new RegExp(`{{${key}}}`, 'g'), rep),
        value
      );
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return replacePlaceholdersSimple(value as Record<string, unknown>, replacements);
    }
    return value;
  };

  return Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k, replaceValue(v)])
  ) as T;
}

export default createHttpSmsConnector;
