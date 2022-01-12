import { ConnectorType } from '@logto/schemas';

import { ConnectorMetadata, EmailSendMessageFunction } from '../types';
import { getConnectorConfig } from '../utils';
import { sendSingleMail } from './send-single-mail';

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

interface Template {
  type: 'SIGN_IN' | 'REGISTER' | 'FORGOT_PASSWORD';
  subject: string;
  content: string; // With variable {{code}}, support HTML
}

export interface AliyunDMConfig {
  accessKeyId: string;
  accessKeySecret: string;
  accountName: string;
  fromAlias?: string;
  replyToAddress?: boolean;
  templates: Template[];
}

export const sendMessage: EmailSendMessageFunction = async (address, type, data) => {
  const config: AliyunDMConfig = await getConnectorConfig<AliyunDMConfig>(
    metadata.id,
    metadata.type
  );
  const template = config.templates.find((template) => template.type === type);
  if (!template) {
    throw new Error(`Can not find template for type: ${type}`);
  }

  return sendSingleMail(
    {
      AccessKeyId: config.accessKeyId,
      AccountName: config.accountName,
      ReplyToAddress: config.replyToAddress ? 'true' : 'false',
      AddressType: '1',
      ToAddress: address,
      FromAlias: config.fromAlias,
      Subject: template.subject,
      HtmlBody: template.content.replaceAll('{{code}}', data.code),
    },
    config.accessKeySecret
  );
};
