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
  },
  readme: './README.md',
  formItems: [
    clientIdFormItem,
    clientSecretFormItem,
    {
      ...scopeFormItem,
      description:
        "The `scope` determines permissions granted by the user's authorization. If you are not sure what to enter, do not worry, just leave it blank.",
    },
  ],
};

export const defaultTimeout = 5000;
