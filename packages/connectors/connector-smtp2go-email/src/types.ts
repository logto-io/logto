import { z } from 'zod';

import { templateTypeGuard, TemplateType } from '@logto/connector-kit';

/**
 * @doc https://apidoc.smtp2go.com/documentation/#/POST/email/send
 */

export enum ContentType {
  Text = 'text/plain',
  Html = 'text/html',
}

/**
 * SMTP2GO API request payload
 */
export type Smtp2goEmailRequest = {
  api_key: string;
  to: string[];
  sender: string;
  subject: string;
  text_body?: string;
  html_body?: string;
  custom_headers?: Array<{
    header: string;
    value: string;
  }>;
};

/**
 * SMTP2GO API success response for `/v3/email/send`.
 *
 * @see https://developers.smtp2go.com/reference/send-standard-email
 */
export type Smtp2goEmailResponse = {
  request_id: string;
  data: {
    succeeded?: number;
    failed?: number;
    failures?: string[];
    email_id?: string;
    schedule_id?: string;
  };
};

/**
 * Template configuration for different usage types
 */
const templateGuard = z.object({
  usageType: templateTypeGuard,
  type: z.nativeEnum(ContentType),
  subject: z.string(),
  content: z.string(), // With variable {{code}}, supports HTML
});

/**
 * SMTP2GO connector configuration
 */
export const smtp2goEmailConfigGuard = z.object({
  apiKey: z.string(),
  sender: z.string().email(),
  senderName: z.string().optional(),
  templates: z.array(templateGuard).refine(
    (templates) =>
      [
        TemplateType.Register,
        TemplateType.SignIn,
        TemplateType.ForgotPassword,
        TemplateType.Generic,
      ].every((requiredType) =>
        templates.map((template) => template.usageType).includes(requiredType)
      ),
    (templates) => ({
      message: `Template with UsageType (${[
        TemplateType.Register,
        TemplateType.SignIn,
        TemplateType.ForgotPassword,
        TemplateType.Generic,
      ]
        .filter(
          (requiredType) => !templates.map((template) => template.usageType).includes(requiredType)
        )
        .join(', ')}) should be provided!`,
    })
  ),
});

export type Smtp2goEmailConfig = z.infer<typeof smtp2goEmailConfigGuard>;
