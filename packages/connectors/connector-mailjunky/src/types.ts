import { z } from 'zod';

import { templateTypeGuard, TemplateType } from '@logto/connector-kit';

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
 * Required template keys for connector config. Additional {@link TemplateType} entries are allowed
 * for optional flows (e.g. organization invitation).
 */
const requiredTemplateUsageTypes = [
  TemplateType.Register,
  TemplateType.SignIn,
  TemplateType.ForgotPassword,
  TemplateType.Generic,
];

const templateGuard = z.object({
  usageType: templateTypeGuard,
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
