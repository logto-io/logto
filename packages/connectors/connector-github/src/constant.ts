import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://github.com/login/oauth/authorize';
export const scope = 'read:user';
export const accessTokenEndpoint = 'https://github.com/login/oauth/access_token';
export const userInfoEndpoint = 'https://api.github.com/user';

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
  ],
};

export const defaultTimeout = 5000;
