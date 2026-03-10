import { assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';
import { z } from 'zod';

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
import type { WhatsAppMessagePayload } from './types.js';
import { whatsappSmsConfigGuard } from './types.js';

const metaErrorResponseGuard = z.object({
  error: z.object({
    message: z.string(),
  }),
});

const parseErrorMessage = (rawBody: string): string => {
  try {
    const parsed: unknown = JSON.parse(rawBody);
    const result = metaErrorResponseGuard.safeParse(parsed);
    return result.success ? result.data.error.message : rawBody;
  } catch {
    return rawBody;
  }
};

const buildMessagePayload = (
  to: string,
  code: string,
  templateName: string,
  language: string
): WhatsAppMessagePayload => ({
  messaging_product: 'whatsapp',
  to,
  type: 'template',
  template: {
    name: templateName,
    language: { code: language },
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: code }],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: code }],
      },
    ],
  },
});

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, whatsappSmsConfigGuard);

    const { accessToken, phoneNumberId, templates } = config;

    const template = templates.find((tmpl) => tmpl.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    const code = String(payload.code ?? '');

    assert(
      code,
      new ConnectorError(ConnectorErrorCodes.General, 'OTP code is missing from payload')
    );

    const messagePayload = buildMessagePayload(to, code, template.templateName, template.language);
    const apiUrl = endpoint.replace('{{phoneNumberId}}', phoneNumberId);

    try {
      return await got.post(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        json: messagePayload,
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

        throw new ConnectorError(ConnectorErrorCodes.General, parseErrorMessage(rawBody));
      }

      throw error;
    }
  };

const createWhatsAppSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: whatsappSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createWhatsAppSmsConnector;
