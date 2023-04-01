import { z } from 'zod';

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic'.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

export const SingleSmsConfig = z.object({
  usageType: z.string(),
  templateCode: z.string(),
});

export const SmsConfigGuard = z.object({
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  signName: z.string(),
  sdkAppId: z.string(),
  region: z.string(),
  templates: z.array(SingleSmsConfig).refine(
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

export type TencentSmsConfig = z.infer<typeof SmsConfigGuard>;

export const tencentErrorResponse = z.object({
  Response: z.object({
    Error: z.object({
      Code: z.string(),
      Message: z.string(),
    }),
  }),
});

export declare type TencentErrorResponse = z.infer<typeof tencentErrorResponse>;

export const SendStatusSetItem = z.object({
  SerialNo: z.string(),
  PhoneNumber: z.string(),
  Fee: z.number(),
  SessionContext: z.string(),
  Code: z.string(),
  Message: z.string(),
  IsoCode: z.string(),
});

export const tencentSuccessResponse = z.object({
  Response: z.object({
    SendStatusSet: z.array(SendStatusSetItem),
    RequestId: z.string(),
  }),
});

export declare type TencentSuccessResponse = z.infer<typeof tencentSuccessResponse>;
