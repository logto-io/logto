import { z } from 'zod';

export { TemplateType, templateTypeGuard } from '@logto/connector-kit';

export type EmailTemplateDetails = {
  subject: string;
  content: string;
  /**
   * OPTIONAL: The content type of the email template.
   *
   * Some email clients may render email templates differently based on the content type. (e.g. Sendgrid, Mailgun)
   * Use this field to specify the content type of the email template.
   */
  contentType?: 'text/html' | 'text/plain';
  /**
   * OPTIONAL: Custom replyTo template.
   *
   * Based on the email client, the replyTo field may be used to customize the reply-to field of the email.
   * @remarks
   * The original reply email value can be found in the template variables.
   */
  replyTo?: string;
  /**
   * OPTIONAL: Custom from template.
   *
   * Based on the email client, the sendFrom field may be used to customize the from field of the email.
   * @remarks
   * The sender email value can be found in the template variables.
   */
  sendFrom?: string;
};

export const emailTemplateDetailsGuard = z.object({
  subject: z.string(),
  content: z.string(),
  contentType: z.union([z.literal('text/html'), z.literal('text/plain')]).optional(),
  replyTo: z.string().optional(),
  sendFrom: z.string().optional(),
}) satisfies z.ZodType<EmailTemplateDetails>;
