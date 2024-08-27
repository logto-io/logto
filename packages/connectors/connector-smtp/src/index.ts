import { assert, conditional } from '@silverhand/essentials';

import type {
  GetConnectorConfig,
  CreateConnector,
  EmailConnector,
  SendMessageFunction,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  replaceSendMessageHandlebars,
} from '@logto/connector-kit';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { defaultMetadata } from './constant.js';
import { ContextType, smtpConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, smtpConfigGuard);
    const template = config.templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    const configOptions: SMTPTransport.Options = config;

    const transporter = nodemailer.createTransport(configOptions);

    const contentsObject = parseContents(
      replaceSendMessageHandlebars(template.content, payload),
      template.contentType
    );

    const mailOptions: Mail.Options = {
      to,
      from: config.fromEmail,
      replyTo: config.replyTo,
      subject: replaceSendMessageHandlebars(template.subject, payload),
      ...conditional(
        config.customHeaders &&
          Object.entries(config.customHeaders).length > 0 && {
            headers: config.customHeaders,
          }
      ),
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
    case ContextType.Text: {
      return { text: contents };
    }
    case ContextType.Html: {
      return { html: contents };
    }
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
