import { conditional, assert } from '@silverhand/essentials';

import type {
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnector,
  CreateConnector,
  GetConnectorConfig,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
} from '@logto/connector-kit';
import {
  constructAuthorizationUri,
  oauth2AuthResponseGuard,
  requestTokenEndpoint,
  TokenEndpointAuthMethod,
} from '@logto/connector-oauth';
import ky, { HTTPError } from 'ky';

import {
  authorizationEndpoint,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
  tokenEndpoint,
} from './constant.js';
import {
  accessTokenResponseGuard,
  huggingfaceConnectorConfigGuard,
  userInfoResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, huggingfaceConnectorConfigGuard);

    const { clientId, scope } = config;

    await setSession({ redirectUri });

    return constructAuthorizationUri(authorizationEndpoint, {
      responseType: 'code',
      clientId,
      scope: scope ?? 'profile', // Defaults to 'profile' if not provided
      redirectUri,
      state,
    });
  };

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession) => {
    const authResponseResult = oauth2AuthResponseGuard.safeParse(data);

    if (!authResponseResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, data);
    }

    const { code } = authResponseResult.data;

    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, huggingfaceConnectorConfigGuard);

    const { clientId, clientSecret } = config;
    const { redirectUri } = await getSession();

    if (!redirectUri) {
      throw new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Cannot find `redirectUri` from connector session.',
      });
    }

    const tokenResponse = await requestTokenEndpoint({
      tokenEndpoint,
      tokenEndpointAuthOptions: {
        method: TokenEndpointAuthMethod.ClientSecretBasic,
      },
      tokenRequestBody: {
        grantType: 'authorization_code',
        code,
        redirectUri,
        clientId,
        clientSecret,
      },
    });

    const parsedTokenResponse = accessTokenResponseGuard.safeParse(await tokenResponse.json());

    if (!parsedTokenResponse.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, parsedTokenResponse.error);
    }

    const { access_token: accessToken, token_type: tokenType } = parsedTokenResponse.data;

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    try {
      const userInfoResponse = await ky.get(userInfoEndpoint, {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
        timeout: defaultTimeout,
      });

      const rawData = parseJson(await userInfoResponse.text());

      const parsedUserInfoResponse = userInfoResponseGuard.safeParse(rawData);

      if (!parsedUserInfoResponse.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, parsedUserInfoResponse.error);
      }

      const { sub, picture, email, name } = parsedUserInfoResponse.data;

      return {
        id: sub,
        avatar: conditional(picture),
        email: conditional(email),
        name: conditional(name),
        rawData,
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { response } = error;

        if (response.status === 401) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, await response.text());
      }

      throw error;
    }
  };

const createHuggingfaceConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: huggingfaceConnectorConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createHuggingfaceConnector;
