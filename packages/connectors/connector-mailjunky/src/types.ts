import { z } from 'zod';

/**
 * MailJunky API Request Body
 * @doc https://www.mailjunky.ai/docs
 */

export type PublicParameters = {
  /** Sender address; MailJunky requires a verified domain / from address. */
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic'.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  type: z.union([z.literal('text/html'), z.literal('text/plain')]).optional(),
  subject: z.string(),
  content: z.string(), // With variable {{code}}, support HTML
});

export const mailJunkyConfigGuard = z.object({
  apiKey: z.string(),
  fromEmail: z.string(),
  fromName: z.string().optional(),
  templates: z.array(templateGuard).superRefine((templates, ctx) => {
    const usageTypes = new Set(templates.map((template) => template.usageType));
    const missing = requiredTemplateUsageTypes.filter(
      (requiredType) => !usageTypes.has(requiredType)
    );
    if (missing.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing required templates for usageType: ${missing.join(', ')}`,
      });
    }
  }),
});

export type MailJunkyConfig = z.infer<typeof mailJunkyConfigGuard>;

/**
 * MailJunky API Error Response
 */

export const mailJunkyErrorResponseGuard = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
});

export type MailJunkyErrorResponse = z.infer<typeof mailJunkyErrorResponseGuard>;
