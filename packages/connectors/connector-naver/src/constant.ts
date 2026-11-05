import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

export const authorizationEndpoint = 'https://nid.naver.com/oauth2.0/authorize';
export const accessTokenEndpoint = 'https://nid.naver.com/oauth2.0/token';
export const userInfoEndpoint = 'https://openapi.naver.com/v1/nid/me';

export const defaultMetadata: ConnectorMetadata = {
  id: 'naver-universal',
  target: 'naver',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Naver',
    'zh-CN': 'Naver',
    'tr-TR': 'Naver',
    ko: '네이버',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Naver is the most leading internet service provider in South Korea',
    'zh-CN': 'Naver is the most leading internet service provider in South Korea',
    'tr-TR': 'Naver is the most leading internet service provider in South Korea',
    ko: '네이버는 한국에서 가장 선도적인 인터넷 서비스 제공자 입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      label: 'Client ID',
      placeholder: '<client-id>',
    },
    {
      key: 'clientSecret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      label: 'Client Secret',
      placeholder: '<client-secret>',
    },
    {
      key: 'disableEmailSync',
      type: ConnectorConfigFormItemType.Switch,
      required: false,
      label: 'Disable Email Sync',
      description:
        'Stop syncing the `email` field returned by Naver to the user profile. Turn this on if you do not want Naver to supply the email address.',
      tooltip:
        'Naver reports no verification state for `email`, which can be an external address the user has set. Turning this on leaves the address in `rawData` only.',
      defaultValue: false,
    },
  ],
};

export const defaultTimeout = 5000;
