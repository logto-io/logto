import { z } from 'zod';

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic'.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(), // SMS message body, supports {{code}} placeholder
});

/**
 * Auth Options
 * See https://nodemailer.com/smtp/#authentication and https://nodemailer.com/smtp/oauth2/.
 */
const loginAuthGuard = z.object({
  user: z.string(),
  pass: z.string(),
  type: z.enum(['login', 'Login', 'LOGIN']).optional(),
});

const oauth2AuthWithKeyGuard = z.object({
  type: z.enum(['oauth2', 'OAuth2', 'OAUTH2']).optional(),
  user: z.string(),
  privateKey: z.string().or(z.object({ key: z.string(), passphrase: z.string() })),
  serviceClient: z.string(),
});

const oauth2AuthWithTokenGuard = z.object({
  type: z.enum(['oauth2', 'OAuth2', 'OAUTH2']).optional(),
  user: z.string(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  refreshToken: z.string().optional(),
  accessToken: z.string().optional(),
  expires: z.number().optional(),
  accessUrl: z.string().optional(),
});

const authGuard = loginAuthGuard.or(oauth2AuthWithKeyGuard).or(oauth2AuthWithTokenGuard);

export const smtpSmsConfigGuard = z.object({
  /** SMTP server hostname */
  host: z.string(),
  /** SMTP server port */
  port: z.number(),
  /** SMTP authentication credentials */
  auth: authGuard,
  /** Email address to send from */
  fromEmail: z.string(),
  /**
   * Template for the recipient email address derived from the phone number.
   * Use {{phone}} as the placeholder for the raw phone number as supplied by Logto (e.g. +12025551234).
   * Use {{phoneNumberOnly}} for the digits-only version (e.g. 12025551234).
   *
   * Example for AT&T (USA): "{{phoneNumberOnly}}@txt.att.net"
   * Example for Verizon (USA): "{{phoneNumberOnly}}@vtext.com"
   */
  toEmailTemplate: z.string(),
  /** SMS message templates per usage type */
  templates: z.array(templateGuard).refine(
    (templates) =>
      requiredTemplateUsageTypes.every((requiredType) =>
        templates.map((template) => template.usageType).includes(requiredType)
      ),
    (templates) => ({
      message: `Template with UsageType (${requiredTemplateUsageTypes
        .filter(
          (requiredType) => !templates.map((template) => template.usageType).includes(requiredType)
        )
        .join(', ')}) should be provided!`,
    })
  ),
  /** Optional email subject line (many SMS gateways ignore this) */
  subject: z.string().optional(),
  /** Use TLS for SMTP connection */
  secure: z.boolean().default(false),
  /** Additional TLS options */
  tls: z
    .union([z.object({}).catchall(z.unknown()), z.object({})])
    .optional()
    .default({}),
  servername: z.string().optional(),
  ignoreTLS: z.boolean().optional(),
  requireTLS: z.boolean().optional(),
  /** Connection timeout in ms (default: 2 minutes) */
  connectionTimeout: z
    .number()
    .optional()
    .default(2 * 60 * 1000),
  /** Greeting timeout in ms (default: 30 seconds) */
  greetingTimeout: z
    .number()
    .optional()
    .default(30 * 1000),
  /** Socket timeout in ms (default: 10 minutes) */
  socketTimeout: z
    .number()
    .optional()
    .default(10 * 60 * 1000),
});

export type SmtpSmsConfig = z.infer<typeof smtpSmsConfigGuard>;
