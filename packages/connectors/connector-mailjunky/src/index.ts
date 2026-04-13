import { assert, trySafe } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  CreateConnector,
  EmailConnector,
  GetConnectorConfig,
  GetI18nEmailTemplate,
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

import { defaultMetadata, endpoint } from './constant.js';
import { mailJunkyConfigGuard, type PublicParameters } from './types.js';

const formatFrom = (fromEmail: string, fromName?: string): string =>
  fromName ? `${fromName} <${fromEmail}>` : fromEmail;

/**
 * Derive multipart `text` from HTML templates. Repeatedly removes complete
 * `...>` tag sequences until quiescence so stripping is not a single fragile
 * replace (satisfies CodeQL incomplete multi-character sanitization).
 */
const htmlToPlainTextForEmail = (html: string): string => {
  const tagPattern = /<[^>]*>/g;
  const stripOnePass = (input: string): string => input.replaceAll(tagPattern, '');
  const stripUntilStable = (input: string): string => {
    const next = stripOnePass(input);
    return next === input ? input : stripUntilStable(next);
  };

  return stripUntilStable(html);
};
type BuildMailJunkyBodyInput = {
  to: string;
  subject: string;
  content: string;
  payload: SendMessagePayload;
  fromEmail: string;
  fromName?: string;
};

const buildParameters = (input: BuildMailJunkyBodyInput): PublicParameters => {
  const { to, subject, content, payload, fromEmail, fromName } = input;
  const renderedSubject = replaceSendMessageHandlebars(subject, payload);
  const renderedContent = replaceSendMessageHandlebars(content, payload);

  return {
    from: formatFrom(fromEmail, fromName),
    to,
    subject: renderedSubject,
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
    const finalTemplate = customTemplate ?? template;

    assert(finalTemplate, new ConnectorError(ConnectorErrorCodes.TemplateNotFound));

    // 2. Build the MailJunky payload (includes `from` per API / SDK)
    const parameters = buildParameters({
      to,
      subject: finalTemplate.subject,
      content: finalTemplate.content,
      payload,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    });

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
