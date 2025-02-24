import { assert, conditional, trySafe } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  EmailConnector,
  SendMessagePayload,
  GetI18nEmailTemplate,
  EmailTemplateDetails,
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

const getDataFromCustomTemplate = (
  { replyTo, subject, content, contentType = 'text/html', sendFrom }: EmailTemplateDetails,
  payload: SendMessagePayload
): Record<string, string | undefined> => {
  return {
    subject: replaceSendMessageHandlebars(subject, payload),
    'h:Reply-To': replyTo && replaceSendMessageHandlebars(replyTo, payload),
    // Since html can render plain text, we always send the content as html
    html: conditional(replaceSendMessageHandlebars(content, payload)),
    // If contentType is text/plain, we will use text instead of html
    text: conditional(
      contentType === 'text/plain' && replaceSendMessageHandlebars(content, payload)
    ),
    // If provided this value will override the from value in the config
    from: sendFrom && replaceSendMessageHandlebars(sendFrom, payload),
  };
};

const sendMessage = (
  getConfig: GetConnectorConfig,
  getI18nEmailTemplate?: GetI18nEmailTemplate
): SendMessageFunction => {
  return async ({ to, type, payload }, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, mailgunConfigGuard);

    const { endpoint, domain, apiKey, from, deliveries } = config;

    const customTemplate = await trySafe(async () => getI18nEmailTemplate?.(type, payload.locale));
    const template = deliveries[type] ?? deliveries[TemplateType.Generic];

    const data = customTemplate
      ? getDataFromCustomTemplate(customTemplate, payload)
      : // Fallback to the default template if the custom i18n template is not found.
        template && getDataFromDeliveryConfig(template, payload);

    assert(data, new ConnectorError(ConnectorErrorCodes.TemplateNotFound));

    try {
      return await got.post(
        new URL(`/v3/${domain}/messages`, endpoint ?? 'https://api.mailgun.net').toString(),
        {
          username: 'api',
          password: apiKey,
          form: {
            from,
            to,
            ...removeUndefinedKeys(data),
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

const createMailgunMailConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
  getI18nEmailTemplate,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: mailgunConfigGuard,
    sendMessage: sendMessage(getConfig, getI18nEmailTemplate),
  };
};

export default createMailgunMailConnector;
