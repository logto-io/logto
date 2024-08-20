import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

export const authorizationEndpointInside = 'https://open.weixin.qq.com/connect/oauth2/authorize';
export const authorizationEndpointQrcode = 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect';
export const accessTokenEndpoint = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
export const userInfoEndpoint = 'https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo';
export const scope = 'snsapi_userinfo';

// See https://developer.work.weixin.qq.com/document/path/90313 to know more about WeCom response error code
export const invalidAuthCodeErrcode = [40_029, 40_163, 42_003];

export const invalidAccessTokenErrcode = [40_001, 40_014];

export const defaultMetadata: ConnectorMetadata = {
  id: 'wecom-universal',
  target: 'wecom',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'WeCom',
    'zh-CN': '企业微信',
    'tr-TR': 'WeCom',
    ko: 'WeCom',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'WeCom is a cross-platform instant messaging app for team. It is the enterprise version of WeChat.',
    'zh-CN': '企业微信,是腾讯微信团队为企业打造的专业办公管理工具。',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'corpId',
      label: 'Corp ID',
      required: true,
      type: ConnectorConfigFormItemType.Text,
      placeholder: '<app-id>',
    },
    {
      key: 'appSecret',
      label: 'App Secret',
      required: true,
      type: ConnectorConfigFormItemType.Text,
      placeholder: '<app-secret>',
    },
    {
      key: 'agentId',
      label: 'Agent ID',
      required: true,
      type: ConnectorConfigFormItemType.Text,
      placeholder: '<agent-id>',
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
