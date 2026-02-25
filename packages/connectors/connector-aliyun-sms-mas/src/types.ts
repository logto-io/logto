import { z } from 'zod';

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
 * Public parameters for Aliyun API requests
 * These are common parameters used across all Aliyun API calls
 * @see https://help.aliyun.com/document_detail/29442.html
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
 * Parameters for SendSmsVerifyCode API
 * All parameters are string type for URL encoding compatibility
 * @see https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode
 */
export type SendSmsVerifyCode = {
  /** 短信接收方手机号（不加区号，如：13012345678） */
  PhoneNumber: string;
  /** 签名名称（必须使用系统赠送签名） */
  SignName: string;
  /** 短信模板 CODE（必须使用系统赠送模板） */
  TemplateCode: string;
  /** 短信模板参数，JSON 格式字符串，如 {"code":"123456","min":"10"} */
  TemplateParam?: string;
  /** 号码国家编码，默认为 86，目前仅支持国内号码 */
  CountryCode?: string;
  /** 方案名称 */
  SchemeName?: string;
  /** 外部流水号 */
  OutId?: string;
  /** 上行短信扩展码 */
  SmsUpExtendCode?: string;
};

const REQUIRED_TEMPLATE_USAGE_TYPES = [
  'Register',
  'SignIn',
  'ForgotPassword',
  'Generic',
  'UserPermissionValidation',
  'BindNewIdentifier',
  'OrganizationInvitation',
  'MfaVerification',
  'BindMfa',
] as const;

export const templateGuard = z.object({
  usageType: z.string(),
  templateCode: z.string(),
});

export type Template = z.infer<typeof templateGuard>;

export const aliyunSmsMasConfigGuard = z.object({
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  signName: z.string(),
  templates: z.array(templateGuard).refine(
    (templates) =>
      REQUIRED_TEMPLATE_USAGE_TYPES.every((requiredType) =>
        templates.map((template) => template.usageType).includes(requiredType)
      ),
    (templates) => ({
      message: `UsageType (${REQUIRED_TEMPLATE_USAGE_TYPES.filter(
        (requiredType) => !templates.map((template) => template.usageType).includes(requiredType)
      ).join(', ')}) should be provided in templates.`,
    })
  ),
});

export type AliyunSmsMasConfig = z.infer<typeof aliyunSmsMasConfigGuard>;
