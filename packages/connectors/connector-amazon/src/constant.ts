import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform, ConnectorConfigFormItemType } from '@logto/connector-kit';

// See https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html
export const authorizationEndpoint = 'https://www.amazon.com/ap/oa';
export const defaultScope = 'profile';
export const accessTokenEndpoint = 'https://api.amazon.com/auth/o2/token';
export const userInfoEndpoint = 'https://api.amazon.com/user/profile';

export const defaultMetadata: ConnectorMetadata = {
  id: 'amazon-universal',
  target: 'amazon',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Amazon',
    'zh-CN': 'Amazon',
    'tr-TR': 'Amazon',
    ko: 'Amazon',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'Amazon is a global online marketplace for buying and selling goods.',
    'zh-CN': 'Amazon是一个全球在线市场，用于购买和销售商品。',
    'tr-TR': 'Amazon, alışveriş yapmak ve ürün satmak için bir online pazar alanıdır.',
    ko: 'Amazon은 구매와 판매를 위한 온라인 시장입니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'clientId',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client ID',
      required: true,
    },
    {
      key: 'clientSecret',
      type: ConnectorConfigFormItemType.Text,
      label: 'Client Secret',
      required: true,
    },
    {
      key: 'scope',
      type: ConnectorConfigFormItemType.MultilineText,
      label: 'Scope',
      required: false,
      description: "The `scope` determines permissions granted by the user's authorization. ",
    },
  ],
};

export const defaultTimeout = 5000;
