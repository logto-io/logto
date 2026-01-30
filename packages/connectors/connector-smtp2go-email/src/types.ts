import { z } from 'zod';

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
 * SMTP2GO API response
 */
export type Smtp2goEmailResponse = {
  data?: {
    error?: string;
    error_code?: string;
    succeeded?: number;
    failed?: number;
    failures?: string[];
  };
  request_id?: string;
};

/**
 * Template configuration for different usage types
 */
const templateGuard = z.object({
  usageType: z.string(),
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
      ['Register', 'SignIn', 'ForgotPassword', 'Generic'].every((requiredType) =>
        templates.map((template) => template.usageType).includes(requiredType)
      ),
    (templates) => ({
      message: `Template with UsageType (${['Register', 'SignIn', 'ForgotPassword', 'Generic']
        .filter(
          (requiredType) => !templates.map((template) => template.usageType).includes(requiredType)
        )
        .join(', ')}) should be provided!`,
    })
  ),
});

export type Smtp2goEmailConfig = z.infer<typeof smtp2goEmailConfigGuard>;
