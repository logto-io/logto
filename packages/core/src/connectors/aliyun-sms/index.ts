import { PasscodeType } from '@logto/schemas';
import { z } from 'zod';

import {
  ConnectorConfigError,
  ConnectorError,
  ConnectorMetadata,
  ConnectorType,
  SmsSendMessageFunction,
  ValidateConfig,
} from '../types';
import { getConnectorConfig } from '../utilities';
import { sendSms } from './single-send-text';

export const metadata: ConnectorMetadata = {
  id: 'aliyun-sms',
  type: ConnectorType.SMS,
  name: {
    en: 'Aliyun Short Message Service',
    zh_CN: '阿里云短信服务',
  },
  logo: './logo.png',
  description: {
    en: 'Short Message Service (SMS) has a batch sending feature and various API operations to send one-time password (OTP) messages, notification messages, and promotional messages to customers.',
    zh_CN:
      '短信服务（Short Message Service）是指通过调用短信发送API，将指定短信内容发送给指定手机用户。',
  },
};

/**
 * Details of TemplateType can be found at:
 * https://next.api.aliyun.com/document/Dysmsapi/2017-05-25/QuerySmsTemplateList.
 *
 * For our use case is to send passcode sms for passwordless sign-in/up as well as
 * reset password, the default value of type code is set to be 2.
 *
 */
enum TemplateType {
  Notification = 0,
  Promotion = 1,
  Passcode = 2,
  InternationalMessage = 6,
  PureNumber = 7,
}

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword' or 'Test'.
 *
 * Type here in the template is used to specify the purpose of sending the sms,
 * can be either item in TemplateType.
 * As the SMS is applied for sending passcode, the value should always be 2 in our case.
 *
 */
const templateGuard = z.object({
  type: z.nativeEnum(TemplateType).default(2),
  usageType: z.nativeEnum(PasscodeType),
  code: z.string().optional(),
  name: z.string().min(1).max(30),
  content: z.string().min(1).max(500),
  remark: z.string(),
});

const configGuard = z.object({
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  signName: z.string(),
  templateCode: z.string(),
  templates: z.array(templateGuard),
});

export const validateConfig: ValidateConfig = async (config: unknown) => {
  if (!config) {
    throw new ConnectorConfigError('Missing config');
  }

  const result = configGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorConfigError(result.error.message);
  }
};

export type AliyunSmsConfig = z.infer<typeof configGuard>;

export const sendMessage: SmsSendMessageFunction = async (phone, type, { code }) => {
  const { accessKeyId, accessKeySecret, signName, templateCode, templates } =
    await getConnectorConfig<AliyunSmsConfig>(metadata.id);
  const template = templates.find(
    ({ code, usageType }) => code === templateCode && usageType === type
  );

  if (!template) {
    throw new ConnectorError(`Can not find template code: ${templateCode}`);
  }

  return sendSms(
    {
      AccessKeyId: accessKeyId,
      PhoneNumbers: phone,
      SignName: signName,
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify({ code }),
    },
    accessKeySecret
  );
};
