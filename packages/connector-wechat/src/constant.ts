import path from 'path';

import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

export const authorizationEndpoint = 'https://open.weixin.qq.com/connect/qrconnect';
export const accessTokenEndpoint = 'https://api.weixin.qq.com/sns/oauth2/access_token';
export const userInfoEndpoint = 'https://api.weixin.qq.com/sns/userinfo';
export const scope = 'snsapi_login';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.json');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.json file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'wechat-web',
  target: 'wechat',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Web,
  name: {
    en: 'WeChat',
    'zh-CN': '微信',
  },
  logo: './logo.svg',
  description: {
    en: 'Sign In with WeChat',
    'zh-CN': '微信登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
