import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';

export const endpoint = 'https://dm.aliyuncs.com/';

export const staticConfigs = {
  Format: 'json',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Version: '2015-11-23',
};

export const defaultMetadata: ConnectorMetadata = {
  id: 'aliyun-direct-mail',
  target: 'aliyun-dm',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'Aliyun Direct Mail',
    'zh-CN': '阿里云邮件推送',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'A simple and efficient email service to help you send transactional notifications and batch email.',
    'zh-CN':
      '邮件推送（DirectMail）是款简单高效的电子邮件群发服务，构建在阿里云基础之上，帮您快速、精准地实现事务邮件、通知邮件和批量邮件的发送。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
