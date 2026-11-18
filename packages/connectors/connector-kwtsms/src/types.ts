// 2026-11-16 02:10 +03: kwtSMS connector config types, new connector for Logto (task: integration kwtsms_logto)
import { z } from 'zod';

/**
 * @doc https://www.kwtsms.com/api-documentation.html
 */

export type PublicParameters = {
  username: string;
  password: string;
  sender: string;
  mobile: string;
  message: string;
  /** "1" queues the message without delivering it, "0" sends it for real. */
  test: '0' | '1';
};

/** Success body of POST /API/send/. */
export const kwtSmsSuccessGuard = z.object({ result: z.literal('OK') }).passthrough();

/** Error body of POST /API/send/ (HTTP 4XX, `result` is "ERROR"). */
export const kwtSmsErrorGuard = z.object({
  result: z.literal('ERROR'),
  code: z.string(),
  description: z.string().optional(),
});

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic' or 'Test'.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(),
});

export const kwtSmsConfigGuard = z.object({
  username: z.string(),
  password: z.string(),
  senderId: z.string().default('KWT-SMS'),
  testMode: z.boolean().default(true),
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

export type KwtSmsConfig = z.infer<typeof kwtSmsConfigGuard>;
