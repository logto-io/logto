import { assert, conditional, trySafe } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  EmailConnector,
  GetI18nEmailTemplate,
  EmailTemplateDetails,
  SendMessagePayload,
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
import { ContextType, sendGridMailConfigGuard } from './types.js';
import type { PublicParameters, SendGridMailConfig } from './types.js';

const buildParametersFromDefaultTemplate = (
  to: string,
  config: SendGridMailConfig,
  template: SendGridMailConfig['templates'][0],
  payload: SendMessagePayload
): PublicParameters => {
  return {
    personalizations: [{ to: [{ email: to }] }],
    from: {
      email: config.fromEmail,
      ...conditional(config.fromName && { name: config.fromName }),
    },
    subject: replaceSendMessageHandlebars(template.subject, payload),
    content: [
      {
        type: template.type,
        value: replaceSendMessageHandlebars(template.content, payload),
      },
    ],
  };
};

const buildParametersFromCustomTemplate = (
  to: string,
  config: SendGridMailConfig,
  { subject, content, sendFrom, contentType = 'text/html' }: EmailTemplateDetails,
  payload: SendMessagePayload
): PublicParameters => {
  return {
    personalizations: [
      {
        to: [
          {
            email: to,
            ...conditional(config.fromName && { name: config.fromName }),
          },
        ],
      },
    ],
    from: {
      email: config.fromEmail,
      // If sendFrom is provided, we will replace the handlebars with the payload
      ...conditional(sendFrom && { name: replaceSendMessageHandlebars(sendFrom, payload) }),
    },
    subject: replaceSendMessageHandlebars(subject, payload),
    content: [
      {
        type: contentType === 'text/html' ? ContextType.Html : ContextType.Text,
        value: replaceSendMessageHandlebars(content, payload),
      },
    ],
  };
};

const sendMessage =
  (
    getConfig: GetConnectorConfig,
    getI18nEmailTemplate?: GetI18nEmailTemplate
  ): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, sendGridMailConfigGuard);
    const { apiKey } = config;

    const customTemplate = await trySafe(async () => getI18nEmailTemplate?.(type, payload.locale));

    const template = getConfigTemplateByType(type, config);

    const parameters = customTemplate
      ? buildParametersFromCustomTemplate(to, config, customTemplate, payload)
      : template && buildParametersFromDefaultTemplate(to, config, template, payload);

    assert(parameters, new ConnectorError(ConnectorErrorCodes.TemplateNotFound));

    try {
      return await got.post(endpoint, {
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
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

      throw new ConnectorError(ConnectorErrorCodes.General, error);
    }
  };

const createSendGridMailConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
  getI18nEmailTemplate,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: sendGridMailConfigGuard,
    sendMessage: sendMessage(getConfig, getI18nEmailTemplate),
  };
};

export default createSendGridMailConnector;
