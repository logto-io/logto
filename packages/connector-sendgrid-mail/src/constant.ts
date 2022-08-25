import { ConnectorType, ConnectorMetadata } from '@logto/connector-core';

export const endpoint = 'https://api.sendgrid.com/v3/mail/send';

export const defaultMetadata: ConnectorMetadata = {
  id: 'sendgrid-email-service',
  target: 'sendgrid-mail',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'SendGrid Mail Service',
    'zh-CN': 'SendGrid 邮件服务',
    'tr-TR': 'SendGrid EMail Servisi',
    'ko-KR': 'SendGrid 메일 서비스',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'SendGrid is a communication platform for transactional and marketing email.',
    'zh-CN': 'SendGrid 是一个面向消费者的邮件通讯平台。',
    'tr-TR': 'SendGrid, operasyonel ve pazarlama e- postaları için bir iletişim platformudur.',
    'ko-KR': 'SendGrids는 마케팅 및 이메일을 전송할 수 있는 플랫폼 입니다.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};
