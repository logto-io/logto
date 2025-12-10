import { assert, conditional, trySafe } from '@silverhand/essentials';

import type {
  GetConnectorConfig,
  CreateConnector,
  EmailConnector,
  SendMessageFunction,
  SendMessagePayload,
  GetI18nEmailTemplate,
  EmailTemplateDetails,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  replaceSendMessageHandlebars,
  getConfigTemplateByType,
} from '@logto/connector-kit';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { defaultMetadata } from './constant.js';
import { ContextType, type SmtpConfig, smtpConfigGuard } from './types.js';

const buildMailOptions = (
  config: SmtpConfig,
  template: SmtpConfig['templates'][number] | EmailTemplateDetails,
  payload: SendMessagePayload,
  to: string
): Mail.Options => {
  return {
    to,
    replyTo:
      'replyTo' in template && template.replyTo
        ? replaceSendMessageHandlebars(template.replyTo, payload)
        : config.replyTo,
    from:
      'sendFrom' in template && template.sendFrom
        ? replaceSendMessageHandlebars(template.sendFrom, payload)
        : config.fromEmail,
    subject: replaceSendMessageHandlebars(template.subject, payload),
    [template.contentType === ContextType.Text ? 'text' : 'html']: replaceSendMessageHandlebars(
      template.content,
      payload
    ),
    ...conditional(
      config.customHeaders &&
        Object.entries(config.customHeaders).length > 0 && {
          headers: config.customHeaders,
        }
    ),
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
    validateConfig(config, smtpConfigGuard);

    const customTemplate = await trySafe(async () => getI18nEmailTemplate?.(type, payload.locale));
    const template = customTemplate ?? getConfigTemplateByType(type, config);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    const configOptions: SMTPTransport.Options = config;
    const transporter = nodemailer.createTransport(configOptions);
    const mailOptions = buildMailOptions(config, template, payload, to);

    try {
      return await transporter.sendMail(mailOptions);
    } catch (error: unknown) {
      throw new ConnectorError(
        ConnectorErrorCodes.General,
        error instanceof Error ? error.message : ''
      );
    }
  };

const createSmtpConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
  getI18nEmailTemplate,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: smtpConfigGuard,
    sendMessage: sendMessage(getConfig, getI18nEmailTemplate),
  };
};

export default createSmtpConnector;
