import { assert, pick } from '@silverhand/essentials';
import { got, HTTPError } from 'got';
import snakecaseKeys from 'snakecase-keys';

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

import { defaultMetadata, defaultTimeout } from './constant.js';
import { oauthConfigGuard } from './types.js';
import { userProfileMapping, getAccessToken } from './utils.js';

const removeUndefinedKeys = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, oauthConfigGuard);
    const parsedConfig = oauthConfigGuard.parse(config);

    const { customConfig, ...rest } = parsedConfig;

    const parameterObject = snakecaseKeys({
      ...pick(rest, 'responseType', 'clientId', 'scope'),
      ...customConfig,
    });

    await setSession({ redirectUri });

    const queryParameters = new URLSearchParams({
      ...removeUndefinedKeys(parameterObject),
      state,
      redirect_uri: redirectUri,
    });

    return `${parsedConfig.authorizationEndpoint}?${queryParameters.toString()}`;
  };

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, oauthConfigGuard);
    const parsedConfig = oauthConfigGuard.parse(config);

    const { redirectUri } = await getSession();
    assert(
      redirectUri,
      new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `redirectUri` from connector session.',
      })
    );

    const { access_token, token_type } = await getAccessToken(parsedConfig, data, redirectUri);

    try {
      const httpResponse = await got.get(parsedConfig.userInfoEndpoint, {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
        timeout: { request: defaultTimeout },
      });
      const rawData = parseJsonObject(httpResponse.body);

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
    configGuard: oauthConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createOauthConnector;
