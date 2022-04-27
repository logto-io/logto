import path from 'path';

import { ConnectorMetadata, ConnectorType } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';
import { z } from 'zod';

export const authorizationEndpoint = 'https://open.weixin.qq.com/connect/qrconnect';
export const accessTokenEndpoint = 'https://api.weixin.qq.com/sns/oauth2/access_token';
export const userInfoEndpoint = 'https://api.weixin.qq.com/sns/userinfo';
export const scope = 'snsapi_login';

export const weChatConfigGuard = z.object({ appId: z.string(), appSecret: z.string() });

export type WeChatConfig = z.infer<typeof weChatConfigGuard>;

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, 'README.md');
const pathToConfigTemplate = path.join(currentPath, 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'wechat',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with WeChat',
    'zh-CN': '微信登录',
  },
  logo: './logo.png',
  description: {
    en: 'Sign In with WeChat',
    'zh-CN': '微信登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
