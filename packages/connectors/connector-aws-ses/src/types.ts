import { z } from 'zod';

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic'.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];
const templateGuard = z.object({
  usageType: z.string(),
  subject: z.string(),
  content: z.string(), // With variable {{code}}, support HTML
});

export type Template = z.infer<typeof templateGuard>;

export const awsSesConfigGuard = z.object({
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  region: z.string(),
  emailAddress: z.string().optional(),
  emailAddressIdentityArn: z.string().optional(),
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
  feedbackForwardingEmailAddress: z.string().optional(),
  feedbackForwardingEmailAddressIdentityArn: z.string().optional(),
  configurationSetName: z.string().optional(),
});

export type AwsSesConfig = z.infer<typeof awsSesConfigGuard>;

export type Payload = {
  code: string | number;
};
