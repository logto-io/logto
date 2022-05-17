import path from 'path';

import { ConnectorType, ConnectorMetadata, ConnectorPlatform } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

export const alipayEndpoint = 'https://openapi.alipay.com/gateway.do';
export const methodForAccessToken = 'alipay.system.oauth.token';
export const methodForUserInfo = 'alipay.user.info.share';

// Constants in this segment are for SDK call
// See: https://opendocs.alipay.com/open/218/105327
export const staticParameters = {
  apiname: 'com.alipay.account.auth',
  method: 'alipay.open.auth.sdk.code.get',
  app_name: 'mc',
  biz_type: 'openservice',
  product_id: 'APP_FAST_LOGIN',
  scope: 'kuaijie',
  auth_type: 'AUTHACCOUNT',
};

export const alipaySigningAlgorithmMapping = {
  RSA: 'RSA-SHA1',
  RSA2: 'RSA-SHA256',
} as const;
export const alipaySigningAlgorithms = ['RSA', 'RSA2'] as const;

export const pidRegEx = /^2088\d{12}$/;

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  target: 'alipay',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Native,
  name: {
    en: 'Sign In with Alipay',
    'zh-CN': '支付宝登录',
  },
  logo: './logo.png',
  description: {
    en: 'Sign In with Alipay',
    'zh-CN': '支付宝登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
