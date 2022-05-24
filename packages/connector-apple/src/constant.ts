import path from 'path';

import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

// https://appleid.apple.com/.well-known/openid-configuration
export const authorizationEndpoint = 'https://appleid.apple.com/auth/authorize';
export const accessTokenEndpoint = 'https://appleid.apple.com/auth/token';
export const jwksUri = 'https://appleid.apple.com/auth/keys';
export const issuer = 'https://appleid.apple.com';

// Note: only support fixed scope for v1.
export const scope = 'openid email name';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'apple-universal',
  target: 'apple',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Apple',
    'zh-CN': 'Apple',
  },
  logo: './logo.svg',
  description: {
    en: 'Sign In with Apple',
    'zh-CN': 'Apple登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
