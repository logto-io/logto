import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform } from '@logto/connector-kit';
import { clientIdFormItem, clientSecretFormItem, scopeFormItem } from '@logto/connector-oauth';

export const authorizationEndpoint = 'https://www.patreon.com/oauth2/authorize';
export const scope = 'identity identity[email]';
export const tokenEndpoint = 'https://www.patreon.com/api/oauth2/token';
export const userInfoEndpoint = 'https://www.patreon.com/api/oauth2/api/current_user';

export const defaultMetadata: ConnectorMetadata = {
  id: 'patreon-universal',
  target: 'patreon',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Patreon',
    'zh-CN': 'Patreon',
    'tr-TR': 'Patreon',
    ko: 'Patreon',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Patreon is a membership platform that makes it easy for artists and creators to get paid.',
    'zh-CN': 'Patreon是一个会员平台，使艺术家和创作者更容易获得报酬。',
    'tr-TR':
      'Patreon, sanatçıların ve içerik üreticilerinin ödeme almasını kolaylaştıran bir üyelik platformudur.',
    ko: 'Patreon은 아티스트와 크리에이터가 쉽게 후원을 받을 수 있도록 돕는 멤버십 플랫폼입니다.',
  },
  readme: './README.md',
  formItems: [
    clientIdFormItem,
    clientSecretFormItem,
    {
      ...scopeFormItem,
      description: "The `scope` determines permissions granted by the user's authorization. ",
    },
  ],
};

export const defaultTimeout = 5000;
