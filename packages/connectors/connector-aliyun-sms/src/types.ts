import { z } from 'zod';

import { SmsTemplateType } from './constant.js';

export const sendSmsResponseGuard = z.object({
  BizId: z.string().optional(),
  Code: z.string(),
  Message: z.string(),
  RequestId: z.string(),
});

export type SendSmsResponse = z.infer<typeof sendSmsResponseGuard>;

/**
 * @doc https://help.aliyun.com/document_detail/101414.html
 */
export type SendSms = {
  OutId?: string;
  PhoneNumbers: string; // 11 digits w/o prefix (can be multiple phone numbers with separator `,`)
  SignName: string; // Name of SMS signature
  SmsUpExtendCode?: string;
  TemplateCode: string; // Text message template ID
  TemplateParam?: string; // Stringified JSON (used to fill in text template)
};

export type PublicParameters = {
  AccessKeyId: string;
  Format?: string; // 'json' or 'xml', default: 'json'
  RegionId?: string; // 'cn-hangzhou' | 'ap-southeast-1' | 'ap-southeast-2'
  Signature?: string;
  SignatureMethod?: string;
  SignatureNonce?: string;
  SignatureVersion?: string;
  Timestamp?: string;
  Version?: string;
};

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword', 'Generic'.
 *
 * Type here in the template is used to specify the purpose of sending the SMS,
 * can be either item in SmsTemplateType.
 * As the SMS is applied for sending verification code, the value should always be 2 in our case.
 */
const requiredTemplateUsageTypes = ['Register', 'SignIn', 'ForgotPassword', 'Generic'];

export const templateGuard = z.object({
  type: z.nativeEnum(SmsTemplateType).default(2),
  usageType: z.string(),
  templateCode: z.string().or(z.object({ china: z.string(), overseas: z.string() })),
});

export type Template = z.infer<typeof templateGuard>;

export const aliyunSmsConfigGuard = z.object({
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

export type AliyunSmsConfig = z.infer<typeof aliyunSmsConfigGuard>;
