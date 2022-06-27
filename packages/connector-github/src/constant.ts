import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';

export const authorizationEndpoint = 'https://github.com/login/oauth/authorize';
export const scope = 'read:user';
export const accessTokenEndpoint = 'https://github.com/login/oauth/access_token';
export const userInfoEndpoint = 'https://api.github.com/user';

export const defaultMetadata: ConnectorMetadata = {
  id: 'github-universal',
  target: 'github',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'GitHub',
    'zh-CN': 'GitHub',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Make signing into Logto seamlessly for GitHub users.',
    'zh-CN': '让 GitHub 用户无缝登录 Logto。',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
