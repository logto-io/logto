import { z } from 'zod';

/**
 * Template usage types that must be configured, so every sign-in flow and invitation can send mail.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  type: z.enum(['text/plain', 'text/html']),
  subject: z.string(),
  content: z.string(), // With variable {{code}}, support HTML
});

export const acsMailConfigGuard = z.object({
  /** The ACS resource endpoint, e.g. `https://<resource>.communication.azure.com`. */
  endpoint: z.string().url(),
  /** A base64 access key of the ACS resource, used to sign each request with HMAC-SHA256. */
  accessKey: z.string().min(1),
  /** A sender address on a domain verified in the ACS resource. */
  fromEmail: z.string().email(),
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
});

export type AcsMailConfig = z.infer<typeof acsMailConfigGuard>;

/**
 * @doc https://learn.microsoft.com/en-us/rest/api/communication/email/send
 */
export type EmailSendRequest = {
  senderAddress: string;
  recipients: { to: Array<{ address: string; displayName?: string }> };
  content: { subject: string; plainText?: string; html?: string };
};
