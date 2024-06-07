import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

import { SocialProvider } from './types.js';

export const defaultMetadata: ConnectorMetadata = {
  id: 'logto-social-demo',
  target: 'logto-social-demo',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Logto Social Demo',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'The demo for social sign-in',
  },
  readme: './README.md',
  isStandard: true,
  formItems: [
    {
      key: 'provider',
      label: 'Provider',
      type: ConnectorConfigFormItemType.Select,
      selectItems: [
        {
          title: 'Google',
          value: SocialProvider.Google,
        },
        {
          title: 'GitHub',
          value: SocialProvider.GitHub,
        },
        {
          title: 'Discord',
          value: SocialProvider.Discord,
        },
      ],
      required: true,
    },
    {
      key: 'clientId',
      label: 'Client ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
    {
      key: 'redirectUri',
      label: 'Redirect URI',
      type: ConnectorConfigFormItemType.Text,
      required: true,
    },
  ],
};

export const getProviderConfigs = (
  provider: SocialProvider
): { endpoint: string; params: Record<string, string> } => {
  if (provider === SocialProvider.GitHub) {
    return {
      params: {
        scope: 'read:user',
      },
      endpoint: 'https://github.com/login/oauth/authorize',
    };
  }

  if (provider === SocialProvider.Google) {
    return {
      params: {
        scope: 'openid profile email',
        response_type: 'code',
      },
      endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    };
  }

  return {
    params: {
      scope: 'identify email',
      response_type: 'code',
    },
    endpoint: 'https://discord.com/oauth2/authorize',
  };
};
