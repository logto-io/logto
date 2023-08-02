import { z } from 'zod';

import { VerificationCodeType } from '@logto/connector-kit';

export const supportTemplateGuard = z.enum([
  VerificationCodeType.SignIn,
  VerificationCodeType.Register,
  VerificationCodeType.ForgotPassword,
  VerificationCodeType.Generic,
]);

type SupportTemplate = z.infer<typeof supportTemplateGuard>;

type CommonEmailConfig = {
  /** Subject of the message. */
  subject?: string;
  /** The email address for recipients to reply to. */
  replyTo?: string;
};

/** The data to send a regular message (email). */
type RawEmailConfig = CommonEmailConfig & {
  /** HTML version of the message. */
  html: string;
  /** Text version of the message. */
  text?: string;
};

/** The data to send a template message (email). */
type TemplateEmailConfig = CommonEmailConfig & {
  /** The template name. */
  template: string;
  /** The template variables. */
  variables?: Record<string, unknown>;
};

/** Config object fot a specific template type. */
export type DeliveryConfig = RawEmailConfig | TemplateEmailConfig;

const templateConfigGuard = z.union([
  z.object({
    html: z.string(),
    text: z.string().optional(),
    subject: z.string().optional(),
    replyTo: z.string().optional(),
  }),
  z.object({
    template: z.string(),
    variables: z.record(z.unknown()).optional(),
    subject: z.string().optional(),
    replyTo: z.string().optional(),
  }),
]) satisfies z.ZodType<DeliveryConfig>;

export type MailgunConfig = {
  /** Mailgun domain. */
  domain: string;
  /** Mailgun API key. */
  apiKey: string;
  /** The sender of the email, in the form `Sender Name <me@samples.mailgun.org>`. */
  from: string;
  /**
   * The template config object for each template type, while the key is the template type
   * and the value is the config object.
   */
  deliveries: Partial<Record<SupportTemplate, DeliveryConfig>>;
};

export const mailgunConfigGuard = z.object({
  domain: z.string(),
  apiKey: z.string(),
  from: z.string(),
  // Although the type it's expected, this guard should infer required keys. Looks like a mis-implemented in zod.
  // See https://github.com/colinhacks/zod/issues/2623
  deliveries: z.record(supportTemplateGuard, templateConfigGuard),
}) satisfies z.ZodType<MailgunConfig>;
