import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorConfigFormItemType, ConnectorPlatform } from '@logto/connector-kit';

/**
 * Base authorization URL.
 * https://developer.kookapp.cn/doc/oauth2
 */
export const authorizationEndpoint = 'https://www.kookapp.cn/app/oauth2/authorize';

/**
 * Token endpoint.
 * https://developer.kookapp.cn/doc/http/oauth#%E8%8E%B7%E5%8F%96AccessToken
 */
export const accessTokenEndpoint = 'https://www.kookapp.cn/api/oauth2/token';

/**
 * User info endpoint.
 * https://developer.kookapp.cn/doc/http/user#%E8%8E%B7%E5%8F%96%E5%BD%93%E5%89%8D%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF
 */

export const userInfoEndpoint = 'https://www.kookapp.cn/api/v3/user/me';

/**
 * OAuth2 Scopes
 * https://developer.kookapp.cn/doc/oauth2#%E7%9B%AE%E5%89%8D%E6%94%AF%E6%8C%81%E7%9A%84%20Scope%20%E5%8F%8A%E5%AF%B9%E5%BA%94%E8%83%BD%E5%8A%9B%E8%8C%83%E5%9B%B4
 */
export const scope = 'get_user_info';

export const defaultMetadata: ConnectorMetadata = {
  id: 'kook-universal',
  target: 'kook',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'KOOK',
    'zh-CN': 'KOOK',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'KOOK is a voice and text chat platform for gamers, which similar to Discord.',
    'zh-CN': 'KOOK 是一个类似 Discord 的主要为游戏玩家设计的语音和文字聊天平台。',
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
      key: 'scope',
      type: ConnectorConfigFormItemType.Text,
      required: false,
      label: 'Scope',
      placeholder: '<scope>',
      description:
        "The `scope` determines permissions granted by the user's authorization. If you are not sure what to enter, do not worry, just leave it blank.",
    },
  ],
};

export const defaultTimeout = 5000;
