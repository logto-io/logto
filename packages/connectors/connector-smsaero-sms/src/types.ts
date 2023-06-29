import { z } from 'zod';

/**
 * @doc https://smsaero.ru/integration/documentation/api/
 */

export type PublicParameters = {
  number: string;
  sign: string;
  text: string;
};

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic' or 'Test'.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(),
});

export const smsAeroConfigGuard = z.object({
  email: z.string().email(),
  apiKey: z.string(),
  senderName: z.string(),
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

export type SmsAeroConfig = z.infer<typeof smsAeroConfigGuard>;
