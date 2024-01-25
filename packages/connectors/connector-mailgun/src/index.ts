import { got, HTTPError } from 'got';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  EmailConnector,
  SendMessagePayload,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  validateConfig,
  TemplateType,
  replaceSendMessageHandlebars,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { type DeliveryConfig, mailgunConfigGuard } from './types.js';

const removeUndefinedKeys = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

const getDataFromDeliveryConfig = (
  { subject, replyTo, ...rest }: DeliveryConfig,
  payload: SendMessagePayload
): Record<string, string | undefined> => {
  const commonData = {
    subject: subject && replaceSendMessageHandlebars(subject, payload),
    'h:Reply-To': replyTo,
  };

  if ('template' in rest) {
    return {
      ...commonData,
      template: rest.template,
      'h:X-Mailgun-Variables': JSON.stringify({ ...rest.variables, ...payload }),
    };
  }

  return {
    ...commonData,
    html: replaceSendMessageHandlebars(rest.html, payload),
    text: rest.text && replaceSendMessageHandlebars(rest.text, payload),
  };
};

const sendMessage = (getConfig: GetConnectorConfig): SendMessageFunction => {
  return async ({ to, type, payload }, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, mailgunConfigGuard);

    const { endpoint, domain, apiKey, from, deliveries } = config;
    const template = deliveries[type] ?? deliveries[TemplateType.Generic];

    if (!template) {
      throw new ConnectorError(ConnectorErrorCodes.TemplateNotFound);
    }

    try {
      return await got.post(
        new URL(`/v3/${domain}/messages`, endpoint ?? 'https://api.mailgun.net').toString(),
        {
          username: 'api',
          password: apiKey,
          form: {
            from,
            to,
            ...removeUndefinedKeys(getDataFromDeliveryConfig(template, payload)),
          },
        }
      );
    } catch (error) {
      if (error instanceof HTTPError) {
        const {
          response: { body, statusCode },
        } = error;

        throw new ConnectorError(ConnectorErrorCodes.General, { statusCode, body });
      }
      throw new ConnectorError(ConnectorErrorCodes.General, error);
    }
  };
};

const createMailgunMailConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: mailgunConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createMailgunMailConnector;
