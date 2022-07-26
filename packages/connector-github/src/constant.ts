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
    'ko-KR': 'GitHub',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'GitHub is an online community for software development and version control.',
    'zh-CN': 'GitHub 是全球最大的代码托管仓库。',
    'ko-KR': 'GitHub는 소프트웨어 개발과 버전 관리를 위한 온라인 커뮤니티입니다.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
