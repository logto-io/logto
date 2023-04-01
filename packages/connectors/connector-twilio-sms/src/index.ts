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
} from '@logto/connector-kit';

import { defaultMetadata, endpoint } from './constant.js';
import type { TwilioSmsConfig, PublicParameters } from './types.js';
import { twilioSmsConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<TwilioSmsConfig>(config, twilioSmsConfigGuard);
    const { accountSID, authToken, fromMessagingServiceSID, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    const parameters: PublicParameters = {
      To: to,
      MessagingServiceSid: fromMessagingServiceSID,
      Body:
        typeof payload.code === 'string'
          ? template.content.replace(/{{code}}/g, payload.code)
          : template.content,
    };

    try {
      return await got.post(endpoint.replace(/{{accountSID}}/g, accountSID), {
        headers: {
          Authorization:
            'Basic ' + Buffer.from([accountSID, authToken].join(':')).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(parameters).toString(),
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody },
        } = error;
        assert(
          typeof rawBody === 'string',
          new ConnectorError(ConnectorErrorCodes.InvalidResponse)
        );

        throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
      }

      throw error;
    }
  };

const createTwilioSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: twilioSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createTwilioSmsConnector;
