import {
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  CreateConnector,
  EmailConnector,
  SendMessageFunction,
  validateConfig,
  ConnectorType,
} from '@logto/connector-core';
import { assert } from '@silverhand/essentials';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { defaultMetadata } from './constant';
import { ContextType, smtpConfigGuard, SmtpConfig } from './types';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<SmtpConfig>(config, smtpConfigGuard);
    const { host, port, username, password, fromEmail, replyTo, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    const configOptions: SMTPTransport.Options = {
      host,
      port,
      auth: {
        user: username,
        pass: password,
      },
      // Set `secure` to be false and `requireTLS` to be true to make sure `nodemailer` calls STARTTLS, which is wildly adopted in email servers.
      secure: false,
      requireTLS: true,
      // Enable `logger` to help debugging.
      logger: true,
    };

    const transporter = nodemailer.createTransport(configOptions);

    const contentsObject = parseContents(
      typeof payload.code === 'string'
        ? template.content.replace(/{{code}}/g, payload.code)
        : template.content,
      template.contentType
    );

    const mailOptions = {
      to,
      from: fromEmail,
      replyTo,
      subject: template.subject,
      ...contentsObject,
    };

    try {
      return await transporter.sendMail(mailOptions);
    } catch (error: unknown) {
      throw new ConnectorError(
        ConnectorErrorCodes.General,
        error instanceof Error ? error.message : ''
      );
    }
  };

const parseContents = (contents: string, contentType: ContextType) => {
  switch (contentType) {
    case ContextType.Text:
      return { text: contents };
    case ContextType.Html:
      return { html: contents };
    default:
      throw new ConnectorError(
        ConnectorErrorCodes.InvalidConfig,
        '`contentType` should be ContextType.'
      );
  }
};

const createSmtpConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: smtpConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createSmtpConnector;
