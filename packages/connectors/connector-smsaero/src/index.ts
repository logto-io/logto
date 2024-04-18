import { assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

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
  replaceSendMessageHandlebars,
  validateConfig,
} from '@logto/connector-kit';

import { defaultMetadata, endpoint } from './constant.js';
import type { PublicParameters } from './types.js';
import { smsAeroConfigGuard } from './types.js';

function sendMessage(getConfig: GetConnectorConfig): SendMessageFunction {
  return async (data, inputConfig) => {
    const { to, type, payload } = data;

    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, smsAeroConfigGuard);

    const { email, apiKey, senderName, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    const parameters: PublicParameters = {
      number: to,
      sign: senderName,
      text: replaceSendMessageHandlebars(template.content, payload),
    };

    const auth = Buffer.from(`${email}:${apiKey}`).toString('base64');

    try {
      return await got.post(endpoint, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        json: parameters,
      });
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
}

const createSmsAeroConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: smsAeroConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createSmsAeroConnector;
