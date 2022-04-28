import path from 'path';

import { ConnectorMetadata, ConnectorType } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

/**
 * @doc https://help.aliyun.com/document_detail/101414.html
 */
export interface SendSms {
  OutId?: string;
  PhoneNumbers: string; // 11 digits w/o prefix (can be multiple phone numbers with separator `,`)
  SignName: string; // Name of SMS signature
  SmsUpExtendCode?: string;
  TemplateCode: string; // Text message template ID
  TemplateParam?: string; // Stringified JSON (used to fill in text template)
}

export const endpoint = 'https://dysmsapi.aliyuncs.com/';

export const staticConfigs = {
  Format: 'json',
  RegionId: 'cn-hangzhou',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Version: '2017-05-25',
};

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'aliyun-sms',
  type: ConnectorType.SMS,
  name: {
    en: 'Aliyun Short Message Service',
    'zh-CN': '阿里云短信服务',
  },
  logo: './logo.png',
  description: {
    en: 'Short Message Service (SMS) has a batch sending feature and various API operations to send one-time password (OTP) messages, notification messages, and promotional messages to customers.',
    'zh-CN':
      '短信服务（Short Message Service）是指通过调用短信发送API，将指定短信内容发送给指定手机用户。',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};
