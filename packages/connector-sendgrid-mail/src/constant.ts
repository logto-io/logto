import path from 'path';

import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

export const endpoint = 'https://api.sendgrid.com/v3/mail/send';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'sendgrid-email-service',
  target: 'sendgrid-mail',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'SendGrid Mail Service',
    'zh-CN': 'SendGrid 邮件服务',
  },
  logo: 'https://gist.githubusercontent.com/darcyYe/31bc893a0a305dc43cf831bf0b14f0fc/raw/faf985d3fbeed88180b8f3cb709892320d66ae45/sendgrid.svg',
  description: {
    en: 'Leverage the email service that customer-first brands trust for reliable inbox delivery at scale.',
    'zh-CN': '客户至上品牌信任的电子邮件服务，实现大规模可靠的收件箱递送。',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};
