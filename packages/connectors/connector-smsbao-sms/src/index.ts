import { assert } from '@silverhand/essentials';
import got, { HTTPError, RequestError } from 'got';

import type {
  CreateConnector,
  GetConnectorConfig,
  SendMessageFunction,
  SmsConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  getConfigTemplateByType,
  replaceSendMessageHandlebars,
} from '@logto/connector-kit';

import { defaultMetadata, defaultTimeout, endpoint } from './constant.js';
import type { SmsbaoSmsConfig } from './types.js';
import { smsbaoSmsConfigGuard } from './types.js';

const errorMessages: Partial<Record<string, string>> = {
  '-1': 'SMSBao request parameters are incomplete',
  '-2': 'SMSBao server environment does not support the request',
  '30': 'SMSBao password error',
  '40': 'SMSBao account does not exist',
  '41': 'SMSBao account has insufficient balance',
  '42': 'SMSBao account has expired',
  '43': 'SMSBao IP address is restricted',
  '50': 'SMSBao message content contains sensitive words',
  '51': 'SMSBao phone number is invalid',
};

const getErrorMessage = (code: string) => errorMessages[code] ?? `SMSBao SMS send failed: ${code}`;

const getValidatedConfig = (rawConfig: unknown): SmsbaoSmsConfig => {
  const result = smsbaoSmsConfigGuard.safeParse(rawConfig);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
  }

  return result.data;
};

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = getValidatedConfig(inputConfig ?? (await getConfig(defaultMetadata.id)));
    const { username, passwordOrApiKey, goodsId } = config;

    const template = getConfigTemplateByType(type, config);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `No SMS template found for type ${type}`
      )
    );

    const messageContent = replaceSendMessageHandlebars(template.content, payload);

    try {
      const { body } = await got.get(endpoint, {
        retry: {
          limit: 0,
        },
        timeout: {
          request: defaultTimeout,
        },
        searchParams: {
          u: username,
          p: passwordOrApiKey,
          ...(goodsId && { g: goodsId }),
          m: to,
          c: messageContent,
        },
      });

      if (body.trim() === '0') {
        return;
      }

      throw new ConnectorError(ConnectorErrorCodes.General, getErrorMessage(body.trim()));
    } catch (error: unknown) {
      if (error instanceof ConnectorError) {
        throw error;
      }

      if (error instanceof HTTPError) {
        throw new ConnectorError(ConnectorErrorCodes.General, String(error.response.body));
      }

      if (error instanceof RequestError) {
        throw new ConnectorError(ConnectorErrorCodes.General, 'SMSBao request failed');
      }

      throw new ConnectorError(
        ConnectorErrorCodes.General,
        error instanceof Error ? error.message : String(error)
      );
    }
  };

const createSmsbaoSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: smsbaoSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createSmsbaoSmsConnector;
