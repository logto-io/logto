import { assert, trySafe } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

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

/** Strip ASCII control characters that must not appear in SMTP header fields (RFC 5322). */
const stripHeaderControlChars = (value: string): string =>
  [...value]
    .filter((character) => {
      const code = character.codePointAt(0);
      return code !== undefined && code > 31 && code !== 127;
    })
    .join('');

/**
 * Sanitize a display name for `From: Name <addr>` so CR/LF cannot inject extra headers and
 * angle brackets cannot break the mailbox token.
 */
const sanitizeMailboxDisplayName = (name: string): string =>
  stripHeaderControlChars(name).replaceAll('<', '').replaceAll('>', '').trim();

/** Local-part angle brackets from malformed `Name <…>` input must not break the outer mailbox token. */
const sanitizeMailboxAddress = (address: string): string =>
  stripHeaderControlChars(address).replaceAll('<', '').replaceAll('>', '').trim();

const formatFrom = (fromEmail: string, fromName?: string): string => {
  const email = sanitizeMailboxAddress(fromEmail);
  if (!fromName) {
    return email;
  }

  const safeName = sanitizeMailboxDisplayName(fromName);
  return safeName.length > 0 ? `${safeName} <${email}>` : email;
};

const parseSendFrom = (
  renderedSendFrom: string,
  fallbackEmail: string,
  fallbackName?: string
): { fromEmail: string; fromName?: string } => {
  // Normalize SMTP header control characters first so mailbox parsing cannot be bypassed by
  // embedding CR/LF before `<` (the `.` token in the mailbox regex does not match line breaks).
  const value = stripHeaderControlChars(renderedSendFrom).trim();

  // Format: "Name <email@domain>"
  const match = /^(.*?)<\s*([^>]+)\s*>$/.exec(value);
  if (match) {
    const name = match[1]?.trim();
    const email = match[2]?.trim();

    if (email) {
      return {
        fromEmail: sanitizeMailboxAddress(email),
        fromName: name?.length ? sanitizeMailboxDisplayName(name) : undefined,
      };
    }
  }

  // Format: "email@domain" (no display name)
  if (value.includes('@') && !value.includes(' ')) {
    return { fromEmail: sanitizeMailboxAddress(value), fromName: undefined };
  }

  // Otherwise treat as display name only
  const rawDisplay = value.length > 0 ? value : fallbackName;
  if (!rawDisplay) {
    return { fromEmail: sanitizeMailboxAddress(fallbackEmail), fromName: undefined };
  }

  const safeName = sanitizeMailboxDisplayName(rawDisplay);
  return {
    fromEmail: sanitizeMailboxAddress(fallbackEmail),
    fromName: safeName.length > 0 ? safeName : undefined,
  };
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
        // Do not surface provider-returned response bodies to avoid leaking sensitive email content.
        const { statusCode, statusMessage } = error.response;
        const message = `MailJunky API request failed${
          statusCode ? ` (status: ${statusCode}${statusMessage ? ` ${statusMessage}` : ''})` : ''
        }.`;
        throw new ConnectorError(ConnectorErrorCodes.General, message);
      }
      throw new ConnectorError(
        ConnectorErrorCodes.General,
        error instanceof Error ? error.message : String(error)
      );
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
