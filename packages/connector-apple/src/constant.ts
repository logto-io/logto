import path from 'path';

import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';

// https://appleid.apple.com/.well-known/openid-configuration
export const issuer = 'https://appleid.apple.com';
export const authorizationEndpoint = `${issuer}/auth/authorize`;
export const accessTokenEndpoint = `${issuer}/auth/token`;
export const jwksUri = `${issuer}/auth/keys`;

// Note: only support fixed scope for v1.
export const scope = ''; // Note: `openid` is required when adding more scope(s)

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.json');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.json file directory.';

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
  logoDark: './logo_dark.svg',
  description: {
    en: 'Sign In with Apple',
    'zh-CN': 'Apple 登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
