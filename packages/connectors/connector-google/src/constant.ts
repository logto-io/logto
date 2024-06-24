import type { ConnectorMetadata } from '@logto/connector-kit';
import {
  ConnectorConfigFormItemType,
  ConnectorPlatform,
  GoogleConnector,
  OidcPrompt,
} from '@logto/connector-kit';

export const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
export const accessTokenEndpoint = 'https://oauth2.googleapis.com/token';
export const userInfoEndpoint = 'https://openidconnect.googleapis.com/v1/userinfo';
export const scope = 'openid profile email';

// Instead of defining the metadata in the connector, we reuse the metadata from the connector-kit.
// This is not the normal practice, but Google One Tap is a special case.
// @see {@link GoogleConnector} for more information.
export const defaultMetadata: ConnectorMetadata = {
  id: GoogleConnector.factoryId,
  target: GoogleConnector.target,
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Google',
    'zh-CN': 'Google',
    'tr-TR': 'Google',
    ko: 'Google',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Google is a principal search engine technology and email service provider.',
    'zh-CN': 'Google 是全球性的搜索引擎和邮件服务提供商。',
    'tr-TR': 'Google, en büyük arama motoru teknolojisi ve e-posta servis sağlayıcısıdır.',
    ko: 'Google은 가장 큰 검색 엔진 기술과 이메일 서비스 제공자입니다.',
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
    {
      key: 'prompts',
      type: ConnectorConfigFormItemType.MultiSelect,
      required: false,
      label: 'Prompts',
      // Google does not support `login` prompt.
      // Ref: https://developers.google.com/identity/openid-connect/openid-connect#authenticationuriparameters
      selectItems: Object.values(OidcPrompt)
        .filter((prompt) => prompt !== OidcPrompt.Login)
        .map((prompt) => ({
          value: prompt,
        })),
    },
  ],
};

export const defaultTimeout = 5000;

// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
export const jwksUri = 'https://www.googleapis.com/oauth2/v3/certs';
