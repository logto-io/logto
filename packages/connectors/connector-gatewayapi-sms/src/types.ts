import { z } from 'zod';

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic'.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(),
});

export const gatewayApiSmsConfigGuard = z.object({
  endpoint: z.string(),
  apiToken: z.string(),
  sender: z.string(),
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

export type GatewayApiSmsConfig = z.infer<typeof gatewayApiSmsConfigGuard>;

export type GatewayApiSmsPayload = {
  sender: string;
  message: string;
  recipients: Array<{ msisdn: string }>;
};
