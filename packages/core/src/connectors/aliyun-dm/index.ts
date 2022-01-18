import { ConnectorConfig, ConnectorType } from '@logto/schemas';

import {
  ConnectorConfigError,
  ConnectorError,
  ConnectorMetadata,
  EmailMessageTypes,
  EmailSendMessageFunction,
  ValidateConfig,
} from '../types';
import { getConnectorConfig } from '../utilities';
import { singleSendMail } from './single-send-mail';

export const metadata: ConnectorMetadata = {
  id: 'aliyun-dm',
  type: ConnectorType.Email,
  name: {
    en: 'Aliyun Direct Mail',
    zh_CN: '阿里云邮件推送',
  },
  logo: './logo.png',
  description: {
    en: 'A simple and efficient email service to help you send transactional notifications and batch email.',
    zh_CN:
      '邮件推送（DirectMail）是款简单高效的电子邮件群发服务，构建在阿里云基础之上，帮您快速、精准地实现事务邮件、通知邮件和批量邮件的发送。',
  },
};

export const validateConfig: ValidateConfig<AliyunDmConfig> = async (config: AliyunDmConfig) => {
  if (!config.accessKeyId) {
    throw new ConnectorConfigError('Missing accessKeyId');
  }

  if (!config.accessKeySecret) {
    throw new ConnectorConfigError('Missing accessKeySecret');
  }

  if (!config.accountName) {
    throw new ConnectorConfigError('Missing accountName');
  }

  if (!Array.isArray(config.templates)) {
    throw new ConnectorConfigError('Missing templates');
  }
};

interface Template {
  type: keyof EmailMessageTypes;
  subject: string;
  content: string; // With variable {{code}}, support HTML
}

export interface AliyunDmConfig extends ConnectorConfig {
  accessKeyId: string;
  accessKeySecret: string;
  accountName: string;
  fromAlias?: string;
  templates: Template[];
}

export const sendMessage: EmailSendMessageFunction = async (address, type, data) => {
  const config: AliyunDmConfig = await getConnectorConfig<AliyunDmConfig>(
    metadata.id,
    metadata.type
  );
  const template = config.templates.find((template) => template.type === type);

  if (!template) {
    throw new ConnectorError(`Can not find template for type: ${type}`);
  }

  return singleSendMail(
    {
      AccessKeyId: config.accessKeyId,
      AccountName: config.accountName,
      ReplyToAddress: 'false',
      AddressType: '1',
      ToAddress: address,
      FromAlias: config.fromAlias,
      Subject: template.subject,
      HtmlBody: template.content.replaceAll('{{code}}', data.code),
    },
    config.accessKeySecret
  );
};
