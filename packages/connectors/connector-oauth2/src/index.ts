import { assert, pick } from '@silverhand/essentials';

import {
  type GetAuthorizationUri,
  type GetUserInfo,
  type SocialConnector,
  type CreateConnector,
  type GetConnectorConfig,
  parseJsonObject,
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
} from '@logto/connector-kit';
import ky, { HTTPError } from 'ky';

import { defaultMetadata, defaultTimeout } from './constant.js';
import { constructAuthorizationUri } from './oauth2/utils.js';
import { oauth2ConnectorConfigGuard } from './types.js';
import { userProfileMapping, getAccessToken } from './utils.js';

export * from './oauth2/index.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, oauth2ConnectorConfigGuard);
    const parsedConfig = oauth2ConnectorConfigGuard.parse(config);

    await setSession({ redirectUri });

    const { authorizationEndpoint, customConfig } = parsedConfig;

    return constructAuthorizationUri(authorizationEndpoint, {
      ...pick(parsedConfig, 'responseType', 'clientId', 'scope'),
      redirectUri,
      state,
      ...customConfig,
    });
  };

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, oauth2ConnectorConfigGuard);
    const parsedConfig = oauth2ConnectorConfigGuard.parse(config);

    const { redirectUri } = await getSession();
    assert(
      redirectUri,
      new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `redirectUri` from connector session.',
      })
    );

    const { access_token, token_type } = await getAccessToken(parsedConfig, data, redirectUri);

    try {
      const httpResponse = await ky.get(parsedConfig.userInfoEndpoint, {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
        timeout: defaultTimeout,
      });

      const rawData = parseJsonObject(await httpResponse.text());

      return { ...userProfileMapping(rawData, parsedConfig.profileMap), rawData };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(error.response.body));
      }

      throw error;
    }
  };

const createOauthConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: oauth2ConnectorConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createOauthConnector;
