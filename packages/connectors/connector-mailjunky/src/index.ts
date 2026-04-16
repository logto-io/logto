import { assert, trySafe } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  CreateConnector,
  EmailConnector,
  GetConnectorConfig,
  GetI18nEmailTemplate,
  EmailTemplateDetails,
  SendMessageFunction,
  SendMessagePayload,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  getConfigTemplateByType,
  replaceSendMessageHandlebars,
  validateConfig,
} from '@logto/connector-kit';
import { convert as htmlToText } from 'html-to-text';

import { defaultMetadata, endpoint } from './constant.js';
import { mailJunkyConfigGuard, type PublicParameters } from './types.js';

const formatFrom = (fromEmail: string, fromName?: string): string =>
  fromName ? `${fromName} <${fromEmail}>` : fromEmail;

const parseSendFrom = (
  renderedSendFrom: string,
  fallbackEmail: string,
  fallbackName?: string
): { fromEmail: string; fromName?: string } => {
  const value = renderedSendFrom.trim();

  // Format: "Name <email@domain>"
  const match = /^(.*?)<\s*([^>]+)\s*>$/.exec(value);
  if (match) {
    const name = match[1]?.trim();
    const email = match[2]?.trim();

    if (email) {
      return { fromEmail: email, fromName: name?.length ? name : undefined };
    }
  }

  // Format: "email@domain" (no display name)
  if (value.includes('@') && !value.includes(' ')) {
    return { fromEmail: value, fromName: undefined };
  }

  // Otherwise treat as display name only
  return { fromEmail: fallbackEmail, fromName: value.length > 0 ? value : fallbackName };
};

/**
 * Derive multipart `text` from HTML templates.
 *
 * Note: Keep this conversion robust for malformed HTML (e.g. "<script" without ">")
 * and ensure the derived string cannot be interpreted as HTML downstream.
 */
const htmlToPlainTextForEmail = (html: string): string => {
  const text = htmlToText(html, {
    wordwrap: false,
    // Keep output compact and stable across environments.
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' },
    ],
  });

  // Ensure no angle brackets remain even if the input contains malformed / partial tags (e.g. "<script")
  // so downstream systems won't treat the derived text as HTML.
  return text.replaceAll('<', '').replaceAll('>', '');
};
type BuildMailJunkyBodyInput = {
  to: string;
  subject: string;
  content: string;
  contentType?: 'text/html' | 'text/plain';
  payload: SendMessagePayload;
  fromEmail: string;
  fromName?: string;
};

const buildParameters = (input: BuildMailJunkyBodyInput): PublicParameters => {
  const { to, subject, content, contentType = 'text/html', payload, fromEmail, fromName } = input;
  const renderedSubject = replaceSendMessageHandlebars(subject, payload);
  const renderedContent = replaceSendMessageHandlebars(content, payload);

  const base: PublicParameters = {
    from: formatFrom(fromEmail, fromName),
    to,
    subject: renderedSubject,
  };

  if (contentType === 'text/plain') {
    return {
      ...base,
      text: renderedContent,
    };
  }

  return {
    ...base,
    html: renderedContent,
    text: htmlToPlainTextForEmail(renderedContent),
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
    validateConfig(config, mailJunkyConfigGuard);
    const { apiKey } = config;

    // 1. Try to get i18n template, fallback to connector config
    const customTemplate = await trySafe(async () => getI18nEmailTemplate?.(type, payload.locale));
    const template = getConfigTemplateByType(type, config);
    assert(customTemplate ?? template, new ConnectorError(ConnectorErrorCodes.TemplateNotFound));

    const buildParametersFromCustomTemplate = (
      details: EmailTemplateDetails,
      fromEmail: string,
      fromName?: string
    ): PublicParameters => {
      const { subject, content, contentType = 'text/html', sendFrom } = details;
      const renderedSendFrom = sendFrom
        ? replaceSendMessageHandlebars(sendFrom, payload)
        : undefined;
      const overriddenFrom = renderedSendFrom
        ? parseSendFrom(renderedSendFrom, fromEmail, fromName)
        : { fromEmail, fromName };

      return buildParameters({
        to,
        subject,
        content,
        contentType,
        payload,
        fromEmail: overriddenFrom.fromEmail,
        fromName: overriddenFrom.fromName,
      });
    };

    // 2. Build the MailJunky payload (includes `from` per API / SDK)
    const parameters = customTemplate
      ? buildParametersFromCustomTemplate(customTemplate, config.fromEmail, config.fromName)
      : (() => {
          assert(template, new ConnectorError(ConnectorErrorCodes.TemplateNotFound));

          return buildParameters({
            to,
            subject: template.subject,
            content: template.content,
            contentType: template.type,
            payload,
            fromEmail: config.fromEmail,
            fromName: config.fromName,
          });
        })();

    try {
      return await got.post(endpoint, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        json: parameters,
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { body } = error.response;
        const message =
          typeof body === 'string'
            ? body
            : Buffer.isBuffer(body)
              ? body.toString()
              : JSON.stringify(body);
        throw new ConnectorError(
          ConnectorErrorCodes.General,
          message === '' ? error.message : message
        );
      }
      throw new ConnectorError(ConnectorErrorCodes.General, error);
    }
  };

const createMailJunkyConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
  getI18nEmailTemplate,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: mailJunkyConfigGuard,
    sendMessage: sendMessage(getConfig, getI18nEmailTemplate),
  };
};

export default createMailJunkyConnector;
