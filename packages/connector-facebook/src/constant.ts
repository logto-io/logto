import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';

/**
 * Note: If you do not include a version number we will default to the oldest available version, so it's recommended to include the version number in your requests.
 * https://developers.facebook.com/docs/graph-api/overview#versions
 */
export const authorizationEndpoint = 'https://www.facebook.com/v13.0/dialog/oauth';
export const accessTokenEndpoint = 'https://graph.facebook.com/v13.0/oauth/access_token';
/**
 * Note: The /me node is a special endpoint that translates to the object ID of the person or Page whose access token is currently being used to make the API calls.
 * https://developers.facebook.com/docs/graph-api/overview#me
 * https://developers.facebook.com/docs/graph-api/reference/user#Reading
 */
export const userInfoEndpoint = 'https://graph.facebook.com/v13.0/me';
export const scope = 'email,public_profile';

export const defaultMetadata: ConnectorMetadata = {
  id: 'facebook-universal',
  target: 'facebook',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Facebook',
    'zh-CN': 'Facebook',
    'tr-TR': 'Facebook',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Facebook is a worldwide social media platform with the most active users.',
    'zh-CN': 'Facebook 是世界使用人数最多的社交平台。',
    'tr-TR': 'Facebook is a worldwide social media platform with the most active users.',
  },
  readme: './README.md',
  configTemplate: './docs/config-template.json',
};

export const defaultTimeout = 5000;
