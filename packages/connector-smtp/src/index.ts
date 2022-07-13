import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  EmailSendMessageFunction,
  ValidateConfig,
  EmailConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { defaultMetadata } from './constant';
import { ContextType, smtpConfigGuard, SmtpConfig } from './types';

export default class SmtpConnector implements EmailConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig: ValidateConfig<SmtpConfig> = async (config: unknown) => {
    const result = smtpConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }

    return result.data;
  };

  public sendMessage: EmailSendMessageFunction = async (address, type, data) => {
    const rawConfig = await this.getConfig(this.metadata.id);
    const config = await this.validateConfig(rawConfig);
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

    const contentsObject = this.parseContents(
      typeof data.code === 'string'
        ? template.content.replace(/{{code}}/g, data.code)
        : template.content,
      template.contentType
    );

    const mailOptions = {
      to: address,
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

  private readonly parseContents = (contents: string, contentType: ContextType) => {
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
}
