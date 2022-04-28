import path from 'path';

import { ConnectorMetadata, ConnectorType } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';
import { z } from 'zod';

export const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
export const accessTokenEndpoint = 'https://oauth2.googleapis.com/token';
export const userInfoEndpoint = 'https://openidconnect.googleapis.com/v1/userinfo';
export const scope = 'openid profile email';

export const googleConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type GoogleConfig = z.infer<typeof googleConfigGuard>;

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'google',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with Google',
    'zh-CN': 'Google登录',
  },
  logo: './logo.png',
  description: {
    en: 'Sign In with Google',
    'zh-CN': 'Google登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
