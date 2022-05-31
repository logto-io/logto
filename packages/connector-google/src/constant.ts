import path from 'path';

import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

export const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
export const accessTokenEndpoint = 'https://oauth2.googleapis.com/token';
export const userInfoEndpoint = 'https://openidconnect.googleapis.com/v1/userinfo';
export const scope = 'openid profile email';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.json');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.json file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'google-universal',
  target: 'google',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Google',
    'zh-CN': 'Google',
  },
  logo: './logo.svg',
  description: {
    en: 'Sign In with Google',
    'zh-CN': 'Google登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
