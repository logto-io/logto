import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform } from '@logto/connector-kit';
import { clientSecretFormItem, clientIdFormItem, scopeFormItem } from '@logto/connector-oauth';

export const jwksUri = 'https://gitlab.com/oauth/discovery/keys';
export const authorizationEndpoint = 'https://gitlab.com/oauth/authorize';
export const userInfoEndpoint = 'https://gitlab.com/oauth/userinfo';
export const tokenEndpoint = 'https://gitlab.com/oauth/token';
export const mandatoryScope = 'openid'; // Always required
export const defaultScopes = [mandatoryScope];

export const defaultMetadata: ConnectorMetadata = {
  id: 'gitlab-universal',
  target: 'gitlab',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'GitLab',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'GitLab is an online community for software development and version control.',
    'zh-CN': 'GitLab 是用于软件开发和版本控制的在线社区。',
    'tr-TR': 'GitLab, yazılım geliştirme ve sürüm kontrolü için çevrimiçi bir topluluktur.',
    ko: 'GitLab은 소프트웨어 개발과 버전 관리를 위한 온라인 커뮤니티입니다.',
  },
  readme: './README.md',
  formItems: [
    clientIdFormItem,
    clientSecretFormItem,
    {
      ...scopeFormItem,
      description:
        "`openid` is required to allow OIDC and it's always added to the scopes if not present, `profile` is required to get user's profile information and `email` is required to get user's email address. These scopes can be used individually or in combination; if no scopes are specified, `openid` will be used by default.",
    },
  ],
};

export const defaultTimeout = 5000;
