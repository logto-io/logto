import path from 'path';

import { ConnectorMetadata, ConnectorType } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

export const endpoint = 'https://dysmsapi.aliyuncs.com/';

export const staticConfigs = {
  Format: 'json',
  RegionId: 'cn-hangzhou',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Version: '2017-05-25',
};

/**
 * Details of SmsTemplateType can be found at:
 * https://next.api.aliyun.com/document/Dysmsapi/2017-05-25/QuerySmsTemplateList.
 *
 * For our use case is to send passcode sms for passwordless sign-in/up as well as
 * reset password, the default value of type code is set to be 2.
 */
export enum SmsTemplateType {
  Notification = 0,
  Promotion = 1,
  Passcode = 2,
  InternationalMessage = 6,
  PureNumber = 7,
}

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'aliyun-short-message-service',
  target: 'aliyun-sms',
  type: ConnectorType.SMS,
  platform: null,
  name: {
    en: 'Aliyun Short Message Service',
    'zh-CN': '阿里云短信服务',
  },
  logo: './logo.svg',
  description: {
    en: 'Short Message Service (SMS) has a batch sending feature and various API operations to send one-time password (OTP) messages, notification messages, and promotional messages to customers.',
    'zh-CN':
      '短信服务（Short Message Service）是指通过调用短信发送API，将指定短信内容发送给指定手机用户。',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};
