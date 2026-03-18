import { defaultTenantId } from '@logto/schemas';
import { generateStandardShortId } from '@logto/shared';
import type { DatabaseTransactionConnection } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

import type { SmtpConfig, SmtpSmsConfig } from './bootstrap-config.js';

/**
 * Default HTML email templates registered with the SMTP connector for every standard usage type
 * (Register, SignIn, ForgotPassword, Generic). Each template renders a `{{code}}` placeholder
 * that Logto replaces with the one-time verification code at send time.
 */
const defaultEmailTemplates = [
  {
    usageType: 'Register',
    contentType: 'text/html',
    subject: 'Your verification code',
    content:
      '<p>Your verification code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>',
  },
  {
    usageType: 'SignIn',
    contentType: 'text/html',
    subject: 'Your sign-in verification code',
    content:
      '<p>Your sign-in verification code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>',
  },
  {
    usageType: 'ForgotPassword',
    contentType: 'text/html',
    subject: 'Reset your password',
    content:
      '<p>Your password reset code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>',
  },
  {
    usageType: 'Generic',
    contentType: 'text/html',
    subject: 'Your verification code',
    content:
      '<p>Your verification code is <strong>{{code}}</strong>. It expires in 10 minutes.</p>',
  },
];

/**
 * Default plain-text SMS templates registered with the SMTP SMS connector for every standard
 * usage type (Register, SignIn, ForgotPassword, Generic). Each template renders a `{{code}}`
 * placeholder that Logto replaces with the one-time verification code at send time.
 */
const defaultSmsTemplates = [
  {
    usageType: 'Register',
    content: 'Your verification code is {{code}}. It expires in 10 minutes.',
  },
  {
    usageType: 'SignIn',
    content: 'Your sign-in verification code is {{code}}. It expires in 10 minutes.',
  },
  {
    usageType: 'ForgotPassword',
    content: 'Your password reset code is {{code}}. It expires in 10 minutes.',
  },
  {
    usageType: 'Generic',
    content: 'Your verification code is {{code}}. It expires in 10 minutes.',
  },
];

/**
 * Registers an SMTP email connector in the default tenant using the built-in
 * `simple-mail-transfer-protocol` connector type.
 *
 * The connector is pre-loaded with {@link defaultEmailTemplates} covering all standard usage
 * types so it is immediately ready to send verification and password-reset emails.
 *
 * @param connection - Active database transaction connection.
 * @param config - SMTP server details and credentials from {@link getSmtpConfig}.
 */
export const bootstrapSmtpConnector = async (
  connection: DatabaseTransactionConnection,
  config: SmtpConfig
) => {
  await connection.query(
    insertInto(
      {
        tenantId: defaultTenantId,
        id: generateStandardShortId(),
        connectorId: 'simple-mail-transfer-protocol',
        config: {
          host: config.host,
          port: config.port,
          auth: config.auth,
          fromEmail: config.fromEmail,
          ...(config.replyTo ? { replyTo: config.replyTo } : {}),
          secure: config.secure,
          templates: defaultEmailTemplates,
        },
        metadata: {},
      },
      'connectors'
    )
  );

  consoleLog.succeed(`Configured SMTP email connector (${config.host}:${config.port})`);
};

/**
 * Registers an SMTP SMS connector in the default tenant using the custom `smtp-sms` connector type.
 *
 * The connector is pre-loaded with {@link defaultSmsTemplates} covering all standard usage types
 * so it is immediately ready to send SMS messages via an email-to-SMS gateway.
 *
 * @param connection - Active database transaction connection.
 * @param config - SMTP server details and gateway template from {@link getSmtpSmsConfig}.
 */
export const bootstrapSmtpSmsConnector = async (
  connection: DatabaseTransactionConnection,
  config: SmtpSmsConfig
) => {
  await connection.query(
    insertInto(
      {
        tenantId: defaultTenantId,
        id: generateStandardShortId(),
        connectorId: 'smtp-sms',
        config: {
          host: config.host,
          port: config.port,
          auth: config.auth,
          fromEmail: config.fromEmail,
          toEmailTemplate: config.toEmailTemplate,
          ...(config.subject ? { subject: config.subject } : {}),
          secure: config.secure,
          templates: defaultSmsTemplates,
        },
        metadata: {},
      },
      'connectors'
    )
  );

  consoleLog.succeed(
    `Configured SMTP SMS connector (${config.host}:${config.port} → ${config.toEmailTemplate})`
  );
};
