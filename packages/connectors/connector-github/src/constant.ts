import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://github.com/login/oauth/authorize';
/**
 * `read:user` read user profile data; `user:email` read user email addresses (including private email addresses).
 * Ref: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
 */
export const scope = 'read:user user:email';
export const accessTokenEndpoint = 'https://github.com/login/oauth/access_token';
export const userInfoEndpoint = 'https://api.github.com/user';
// Ref: https://docs.github.com/en/rest/users/emails?apiVersion=2022-11-28#list-email-addresses-for-the-authenticated-user
export const userEmailsEndpoint = 'https://api.github.com/user/emails';

export const defaultMetadata: ConnectorMetadata = {
  id: 'github-universal',
  target: 'github',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'GitHub',
    'zh-CN': 'GitHub',
    'tr-TR': 'GitHub',
    ko: 'GitHub',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'GitHub is an online community for software development and version control.',
    'zh-CN': 'GitHub 是极受欢迎的代码托管仓库。',
    'tr-TR': 'GitHub, yazılım geliştirme ve sürüm kontrolü için çevrimiçi bir topluluktur.',
    ko: 'GitHub는 소프트웨어 개발과 버전 관리를 위한 온라인 커뮤니티입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client ID',
      required: true,
      placeholder: '<client-id>',
    },
    {
      key: 'clientSecret',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client Secret',
      required: true,
      placeholder: '<client-secret>',
    },
    {
      key: 'scope',
      type: ConnectorConfigFormItemType.Text,
      label: 'Scope',
      required: false,
      placeholder: '<scope>',
      description:
        "The `scope` determines permissions granted by the user's authorization. If you are not sure what to enter, do not worry, just leave it blank.",
    },
  ],
  isTokenStorageSupported: true,
};

export const defaultTimeout = 5000;
