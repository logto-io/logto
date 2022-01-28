import { z } from 'zod';

import {
  ConnectorConfigError,
  ConnectorError,
  ConnectorMetadata,
  ConnectorType,
  TextSendMessageFunction,
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

export const validateConfig: ValidateConfig = async (config: unknown) => {
  if (!config) {
    throw new ConnectorConfigError('Missing config');
  }

  const result = configGuard.safeParse(config);

  if (!result.success) {
    throw new ConnectorConfigError(result.error.message);
  }
};

export enum TemplateType {
  Passcode = 0,
  Notification = 1,
  Promotion = 2,
  InternationalMessage = 3,
}

const configGuard = z.object({
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  signName: z.string(),
  templates: z.array(
    z.object({
      type: z.nativeEnum(TemplateType).default(0),
      code: z.string().optional(),
      name: z.string().min(1).max(30),
      content: z.string().min(1).max(500),
      remark: z.string(),
    })
  ),
});

export type AliyunSmsConfig = z.infer<typeof configGuard>;

export const sendMessage: TextSendMessageFunction = async (
  phone,
  signName,
  templateCode,
  payload
) => {
  const config = await getConnectorConfig<AliyunSmsConfig>(metadata.id);
  const template = config.templates.find((template) => template.code === templateCode);

  if (!template) {
    throw new ConnectorError(`Can not find template code: ${templateCode}`);
  }

  return sendSms(
    {
      AccessKeyId: config.accessKeyId,
      PhoneNumbers: phone,
      SignName: signName,
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify({ code: payload.code }),
    },
    config.accessKeySecret
  );
};
