import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://www.patreon.com/oauth2/authorize';
export const scope = 'identity identity[email]';
export const accessTokenEndpoint = 'https://www.patreon.com/api/oauth2/token';
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
};

export const defaultTimeout = 5000;
