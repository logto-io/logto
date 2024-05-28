import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

// https://open.dingtalk.com/document/orgapp-server/use-dingtalk-account-to-log-on-to-third-party-websites-1
export const authorizationEndpoint = 'https://login.dingtalk.com/oauth2/auth';
// https://open.dingtalk.com/document/isvapp/obtain-user-token
export const accessTokenEndpoint = 'https://api.dingtalk.com/v1.0/oauth2/userAccessToken';
// https://open.dingtalk.com/document/isvapp/dingtalk-retrieve-user-information
// To obtain the current authorized person's information, the unionId parameter can be set to "me".
export const userInfoEndpoint = 'https://api.dingtalk.com/v1.0/contact/users/me';
export const scope = 'openid';

export const defaultMetadata: ConnectorMetadata = {
  id: 'dingtalk-web',
  target: 'dingtalk',
  platform: ConnectorPlatform.Web,
  name: {
    en: 'DingTalk',
    'zh-CN': '钉钉',
    'tr-TR': 'DingTalk',
    ko: 'DingTalk',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'DingTalk is an enterprise-level intelligent mobile office platform launched by Alibaba Group.',
    'zh-CN': '钉钉是一个由阿里巴巴集团推出的企业级智能移动办公平台。',
    'tr-TR':
      'DingTalk, Alibaba Grubu tarafından piyasaya sürülen kurumsal düzeyde akıllı mobil ofis platformudur.',
    ko: '딩톡은 알리바바 그룹이 출시한 기업용 지능형 모바일 오피스 플랫폼입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      label: 'Client ID',
      required: true,
      type: ConnectorConfigFormItemType.Text,
      placeholder: '<client-id>',
    },
    {
      key: 'clientSecret',
      label: 'Client Secret',
      required: true,
      type: ConnectorConfigFormItemType.Text,
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
