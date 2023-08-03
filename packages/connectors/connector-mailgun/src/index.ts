import { got, HTTPError } from 'got';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  EmailConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  validateConfig,
  VerificationCodeType,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import {
  type DeliveryConfig,
  mailgunConfigGuard,
  supportTemplateGuard,
  type MailgunConfig,
} from './types.js';

const removeUndefinedKeys = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

const getDataFromDeliveryConfig = (
  { subject, replyTo, ...rest }: DeliveryConfig,
  code: string
): Record<string, string | undefined> => {
  const commonData = {
    subject: subject?.replaceAll('{{code}}', code),
    'h:Reply-To': replyTo,
  };

  if ('template' in rest) {
    return {
      ...commonData,
      template: rest.template,
      'h:X-Mailgun-Variables': JSON.stringify({ ...rest.variables, code }),
    };
  }

  return {
    ...commonData,
    html: rest.html.replaceAll('{{code}}', code),
    text: rest.text?.replaceAll('{{code}}', code),
  };
};

const sendMessage = (getConfig: GetConnectorConfig): SendMessageFunction => {
  return async ({ to, type: typeInput, payload: { code } }, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<MailgunConfig>(config, mailgunConfigGuard);

    const { domain, apiKey, from, deliveries } = config;
    const type = supportTemplateGuard.safeParse(typeInput);

    if (!type.success) {
      throw new ConnectorError(ConnectorErrorCodes.TemplateNotSupported);
    }

    const template = deliveries[type.data] ?? deliveries[VerificationCodeType.Generic];

    if (!template) {
      throw new ConnectorError(ConnectorErrorCodes.TemplateNotFound);
    }

    try {
      return await got.post(`https://api.mailgun.net/v3/${domain}/messages`, {
        username: 'api',
        password: apiKey,
        form: {
          from,
          to,
          ...removeUndefinedKeys(getDataFromDeliveryConfig(template, code)),
        },
      });
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

const createSendGridMailConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: mailgunConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createSendGridMailConnector;
