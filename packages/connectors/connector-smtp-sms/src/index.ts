import { assert, trySafe } from '@silverhand/essentials';

import type {
  GetConnectorConfig,
  CreateConnector,
  SmsConnector,
  SendMessageFunction,
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

import { defaultMetadata } from './constant.js';
import { type SmtpSmsConfig, smtpSmsConfigGuard } from './types.js';

/**
 * Derives the SMS gateway email address from the recipient phone number using
 * the configured template. Supports two placeholders:
 *   - {{phone}}           the phone number as provided (e.g. +12025551234)
 *   - {{phoneNumberOnly}} digits only (e.g. 12025551234)
 */
const buildToEmail = (toEmailTemplate: string, phoneNumber: string): string => {
  const phoneNumberOnly = phoneNumber.replaceAll(/\D/g, '');
  return toEmailTemplate.replace('{{phone}}', phoneNumber).replace('{{phoneNumberOnly}}', phoneNumberOnly);
};

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, smtpSmsConfigGuard);

    const template = await trySafe(async () => getConfigTemplateByType(type, config));

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    const toEmail = buildToEmail(config.toEmailTemplate, to);
    const messageBody = replaceSendMessageHandlebars(template.content, payload);

    const configOptions: SmtpSmsConfig = config;
    const transporter = nodemailer.createTransport(configOptions);

    try {
      return await transporter.sendMail({
        from: config.fromEmail,
        to: toEmail,
        ...(config.subject && { subject: config.subject }),
        text: messageBody,
      });
    } catch (error: unknown) {
      throw new ConnectorError(
        ConnectorErrorCodes.General,
        error instanceof Error ? error.message : String(error)
      );
    }
  };

const createSmtpSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: smtpSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createSmtpSmsConnector;
