import { emailRegEx } from '@logto/shared';
import { z } from 'zod';

/**
 * @doc https://nodemailer.com/smtp/
 */

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword' or 'Test'.
 */
export enum ContextType {
  Text = 'text/plain',
  Html = 'text/html',
}

const templateGuard = z.object({
  usageType: z.string(),
  contentType: z.nativeEnum(ContextType),
  subject: z.string(),
  content: z.string(), // With variable {{code}}, support HTML
});

export const smtpConfigGuard = z.object({
  host: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
  fromEmail: z.string().regex(emailRegEx),
  replyTo: z.string().regex(emailRegEx).optional(),
  templates: z.array(templateGuard),
});

export type SmtpConfig = z.infer<typeof smtpConfigGuard>;
