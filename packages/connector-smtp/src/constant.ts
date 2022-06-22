import path from 'path';

import { ConnectorType, ConnectorMetadata } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.json');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.json file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'simple-mail-transfer-protocol',
  target: 'smtp',
  type: ConnectorType.Email,
  platform: null,
  name: {
    en: 'SMTP',
    'zh-CN': 'SMTP',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Simple Mail Transfer Protocol.',
    'zh-CN': '简单邮件传输协议。',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};
