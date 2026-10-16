import { assert, trySafe } from '@silverhand/essentials';
import { got, HTTPError } from 'got';
import { createHash, createHmac } from 'node:crypto';

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

import { apiVersion, defaultMetadata } from './constant.js';
import { acsMailConfigGuard } from './types.js';
import type { AcsMailConfig, EmailSendRequest } from './types.js';

/**
 * Sign a request with the ACS access key, following the HMAC-SHA256 scheme of the ACS REST API:
 * the string to sign covers the method, the path and query, and the `x-ms-date`, host and body
 * hash signed headers.
 *
 * @doc https://learn.microsoft.com/en-us/azure/communication-services/tutorials/hmac-header-tutorial
 */
export const signRequest = ({
  url,
  body,
  accessKey,
  date = new Date(),
}: {
  url: URL;
  body: string;
  accessKey: string;
  date?: Date;
}) => {
  const xMsDate = date.toUTCString();
  const contentHash = createHash('sha256').update(body).digest('base64');
  const stringToSign = [
    'POST',
    `${url.pathname}${url.search}`,
    `${xMsDate};${url.host};${contentHash}`,
  ].join('\n');
  const signature = createHmac('sha256', Buffer.from(accessKey, 'base64'))
    .update(stringToSign)
    .digest('base64');

  return {
    'x-ms-date': xMsDate,
    'x-ms-content-sha256': contentHash,
    Authorization: `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${signature}`,
  };
};

const buildRequest = (
  to: string,
  config: AcsMailConfig,
  {
    subject,
    content,
    contentType = 'text/html',
  }: Pick<EmailTemplateDetails, 'subject' | 'content' | 'contentType'>,
  payload: SendMessagePayload
): EmailSendRequest => {
  const body = replaceSendMessageHandlebars(content, payload);

  return {
    senderAddress: config.fromEmail,
    recipients: { to: [{ address: to }] },
    content: {
      subject: replaceSendMessageHandlebars(subject, payload),
      ...(contentType === 'text/html' ? { html: body } : { plainText: body }),
    },
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
    validateConfig(config, acsMailConfigGuard);

    const customTemplate = await trySafe(async () => getI18nEmailTemplate?.(type, payload.locale));
    const template = getConfigTemplateByType(type, config);

    const emailRequest = customTemplate
      ? buildRequest(to, config, customTemplate, payload)
      : template && buildRequest(to, config, { ...template, contentType: template.type }, payload);

    assert(emailRequest, new ConnectorError(ConnectorErrorCodes.TemplateNotFound));

    const url = new URL(`/emails:send?api-version=${apiVersion}`, config.endpoint);
    const body = JSON.stringify(emailRequest);

    try {
      return await got.post(url, {
        headers: {
          ...signRequest({ url, body, accessKey: config.accessKey }),
          'Content-Type': 'application/json',
        },
        body,
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

const createAcsMailConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
  getI18nEmailTemplate,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: acsMailConfigGuard,
    sendMessage: sendMessage(getConfig, getI18nEmailTemplate),
  };
};

export default createAcsMailConnector;
