import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

export const codeEndpoint = 'https://passport.feishu.cn/suite/passport/oauth/authorize';

export const accessTokenEndpoint = 'https://passport.feishu.cn/suite/passport/oauth/token';

export const userInfoEndpoint = 'https://passport.feishu.cn/suite/passport/oauth/userinfo';

export const defaultMetadata: ConnectorMetadata = {
  id: 'feishu-web',
  target: 'feishu',
  platform: ConnectorPlatform.Web,
  name: {
    en: 'Feishu',
    'zh-CN': '飞书',
    'tr-TR': 'Feishu',
    ko: 'Feishu',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Feishu is an enterprise collaboration platform developed by ByteDance.',
    'zh-CN': '飞书是由字节跳动开发的企业协作与管理平台。',
    'tr-TR': 'Feishu, ByteDance tarafından geliştirilen kurumsal bir iş birliği platformudur.',
    ko: 'Feishu는 ByteDance가 개발한 엔터프라이즈 협업 플랫폼입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'appId',
      label: 'App ID',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<app-id>',
    },
    {
      key: 'appSecret',
      label: 'App Secret',
      type: ConnectorConfigFormItemType.Text,
      required: true,
      placeholder: '<app-secret>',
    },
  ],
};
