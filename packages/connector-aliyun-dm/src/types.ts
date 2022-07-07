import { z } from 'zod';

export const sendEmailResponseGuard = z.object({
  EnvId: z.string(),
  RequestId: z.string(),
});

export type SendEmailResponse = z.infer<typeof sendEmailResponseGuard>;

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword' or 'Test'.
 */
const templateGuard = z.object({
  usageType: z.string(),
  subject: z.string(),
  content: z.string(), // With variable {{code}}, support HTML
});

export const aliyunDmConfigGuard = z.object({
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  accountName: z.string(),
  fromAlias: z.string().optional(),
  templates: z.array(templateGuard),
});

export type AliyunDmConfig = z.infer<typeof aliyunDmConfigGuard>;

/**
 * @doc https://help.aliyun.com/document_detail/29444.html
 */
export type SingleSendMail = {
  AccountName: string;
  AddressType: '0' | '1';
  ClickTrace?: '0' | '1';
  FromAlias?: string;
  HtmlBody?: string;
  ReplyToAddress: 'true' | 'false';
  Subject: string;
  TagName?: string;
  TextBody?: string;
  ToAddress: string;
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
 * @doc https://next.api.aliyun.com/troubleshoot
 */
export const sendMailErrorResponseGuard = z.object({
  Code: z.string(),
  Message: z.string(),
  RequestId: z.string().optional(),
  HostId: z.string().optional(),
  Recommend: z.string().optional(),
});

export type SendMailErrorResponse = z.infer<typeof sendMailErrorResponseGuard>;
