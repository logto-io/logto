import path from 'path';

import { ConnectorType, ConnectorMetadata, ConnectorPlatform } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

export const authorizationEndpoint = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm';
export const alipayEndpoint = 'https://openapi.alipay.com/gateway.do';
export const scope = 'auth_user';
export const methodForAccessToken = 'alipay.system.oauth.token';
export const methodForUserInfo = 'alipay.user.info.share';

export const alipaySigningAlgorithmMapping = {
  RSA: 'RSA-SHA1',
  RSA2: 'RSA-SHA256',
} as const;
export const alipaySigningAlgorithms = ['RSA', 'RSA2'] as const;

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'alipay-web',
  target: 'alipay',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Web,
  name: {
    en: 'Alipay',
    'zh-CN': '支付宝',
  },
  logo: 'https://gist.githubusercontent.com/darcyYe/31bc893a0a305dc43cf831bf0b14f0fc/raw/faf985d3fbeed88180b8f3cb709892320d66ae45/alipay.svg',
  description: {
    en: 'Sign In with Alipay',
    'zh-CN': '支付宝登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
