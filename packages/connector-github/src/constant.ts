import path from 'path';

import { ConnectorMetadata, ConnectorType } from '@logto/connector-types';
import { getFileContents } from '@logto/shared';
import { z } from 'zod';

export const authorizationEndpoint = 'https://github.com/login/oauth/authorize';
export const scope = 'read:user';
export const accessTokenEndpoint = 'https://github.com/login/oauth/access_token';
export const userInfoEndpoint = 'https://api.github.com/user';

export const githubConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type GithubConfig = z.infer<typeof githubConfigGuard>;

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, '..', 'README.md');
const pathToConfigTemplate = path.join(currentPath, '..', 'docs', 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  id: 'github',
  type: ConnectorType.Social,
  name: {
    en: 'Sign In with GitHub',
    'zh-CN': 'GitHub登录',
  },
  logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
  description: {
    en: 'Sign In with GitHub',
    'zh-CN': 'GitHub登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
