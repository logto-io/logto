import path from 'path';

import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

export const endpoint = 'https://api.twilio.com/2010-04-01/Accounts/{{accountSID}}/Messages.json';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'twilio-short-message-service',
  target: 'twilio-sms',
  type: ConnectorType.SMS,
  platform: null,
  name: {
    en: 'Twilio SMS Service',
    'zh-CN': 'Twilio 短信服务',
  },
  logo: 'https://gist.githubusercontent.com/darcyYe/31bc893a0a305dc43cf831bf0b14f0fc/raw/faf985d3fbeed88180b8f3cb709892320d66ae45/twilio.svg',
  description: {
    en: 'Messaging APIs for reliable SMS delivery.',
    'zh-CN': '可信赖的短信消息 API。',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};
