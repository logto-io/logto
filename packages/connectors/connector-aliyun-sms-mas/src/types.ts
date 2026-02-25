import { z } from 'zod';

/**
 * Response guard for SendSmsVerifyCode API
 * @doc https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode
 *
 * Note: Unlike standard SMS service, MAS response includes a Model object
 * that contains additional fields like VerifyCode (when ReturnVerifyCode is true)
 */
export const sendSmsVerifyCodeResponseGuard = z.object({
  Code: z.string(),
  Message: z.string(),
  RequestId: z.string().optional(),
  Model: z
    .object({
      VerifyCode: z.string().optional(),
      RequestId: z.string().optional(),
      OutId: z.string().optional(),
      BizId: z.string().optional(),
    })
    .optional(),
});

export type SendSmsVerifyCodeResponse = z.infer<typeof sendSmsVerifyCodeResponseGuard>;

/**
 * SendSmsVerifyCode API request parameters
 * @doc https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode
 *
 * Key parameters:
 * - PhoneNumber: Target phone number (single number, not array like standard SMS)
 * - SignName: Must be one of the system-provided signatures
 * - TemplateCode: Must be one of the system-provided template codes (100001-100005)
 * - TemplateParam: JSON string with code and min (e.g., {"code":"123456","min":"10"})
 */
export type SendSmsVerifyCode = {
  SchemeName?: string;
  CountryCode?: string;
  PhoneNumber: string;
  SignName: string;
  TemplateCode: string;
  TemplateParam: string;
  SmsUpExtendCode?: string;
  OutId?: string;
  CodeLength?: string;
  ValidTime?: string;
  DuplicatePolicy?: string;
  Interval?: string;
  CodeType?: string;
  ReturnVerifyCode?: string;
  AutoRetry?: string;
};

/**
 * Public parameters required for all Aliyun API requests
 * These are combined with request-specific parameters
 */
export type PublicParameters = {
  AccessKeyId: string;
  Format?: string;
  RegionId?: string;
  Signature?: string;
  SignatureMethod?: string;
  SignatureNonce?: string;
  SignatureVersion?: string;
  Timestamp?: string;
  Version?: string;
};

/**
 * Required template usage types
 * These must all be present in the connector configuration
 * For MAS, some types may reuse the same template code (e.g., 100001 for multiple types)
 */
const requiredTemplateUsageTypes = [
  'Register',
  'SignIn',
  'ForgotPassword',
  'OrganizationInvitation',
  'Generic',
  'UserPermissionValidation',
  'BindNewIdentifier',
  'MfaVerification',
  'BindMfa',
];

/**
 * Template configuration guard
 * Simplified for MAS - only usageType and templateCode are needed
 * (No template type selection needed as MAS only supports verification code)
 */
export const templateGuard = z.object({
  usageType: z.string(),
  templateCode: z.string(),
});

export type Template = z.infer<typeof templateGuard>;

/**
 * Connector configuration guard
 * Validates that all required usage types are present in templates
 */
export const aliyunSmsMasConfigGuard = z.object({
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  signName: z.string(),
  templates: z.array(templateGuard).refine(
    (templates) =>
      requiredTemplateUsageTypes.every((requiredType) =>
        templates.map((template) => template.usageType).includes(requiredType)
      ),
    (templates) => ({
      message: `UsageType (${requiredTemplateUsageTypes
        .filter(
          (requiredType) => !templates.map((template) => template.usageType).includes(requiredType)
        )
        .join(', ')}) should be provided in templates.`,
    })
  ),
});

export type AliyunSmsMasConfig = z.infer<typeof aliyunSmsMasConfigGuard>;
