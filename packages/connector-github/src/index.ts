import {
  GetAuthorizationUri,
  GetUserInfo,
  ConnectorError,
  ConnectorErrorCodes,
  codeDataGuard,
  SocialConnector,
  CreateConnector,
  GetConnectorConfig,
  validateConfig,
} from '@logto/connector-core';
import { assert, conditional } from '@silverhand/essentials';
import got, { HTTPError } from 'got';
import * as qs from 'query-string';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  scope,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant';
import {
  authorizationCallbackErrorGuard,
  githubConfigGuard,
  accessTokenResponseGuard,
  GithubConfig,
  userInfoResponseGuard,
} from './types';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<GithubConfig>(config, githubConfigGuard);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      state,
      scope, // Only support fixed scope for v1.
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = codeDataGuard.safeParse(parameterObject);

  if (result.success) {
    return result.data;
  }

  const parsedError = authorizationCallbackErrorGuard.safeParse(parameterObject);

  if (!parsedError.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  const { error, error_description, error_uri } = parsedError.data;

  if (error === 'access_denied') {
    throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, error_description);
  }

  throw new ConnectorError(ConnectorErrorCodes.General, {
    error,
    errorDescription: error_description,
    error_uri,
  });
};

export const getAccessToken = async (config: GithubConfig, code: string) => {
  const { clientId: client_id, clientSecret: client_secret } = config;

  const httpResponse = await got.post({
    url: accessTokenEndpoint,
    json: {
      client_id,
      client_secret,
      code,
    },
    timeout: defaultTimeout,
  });

  const result = accessTokenResponseGuard.safeParse(qs.parse(httpResponse.body));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
  }

  const { access_token: accessToken } = result.data;

  assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code } = await authorizationCallbackHandler(data);
    const config = await getConfig(defaultMetadata.id);
    validateConfig<GithubConfig>(config, githubConfigGuard);
    const { accessToken } = await getAccessToken(config, code);

    try {
      const httpResponse = await got.get(userInfoEndpoint, {
        headers: {
          authorization: `token ${accessToken}`,
        },
        timeout: defaultTimeout,
      });

      const result = userInfoResponseGuard.safeParse(JSON.parse(httpResponse.body));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
      }

      const { id, avatar_url: avatar, email, name } = result.data;

      return {
        id: String(id),
        avatar: conditional(avatar),
        email: conditional(email),
        name: conditional(name),
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { statusCode, body: rawBody } = error.response;

        if (statusCode === 401) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
      }

      throw error;
    }
  };

const createGithubConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    configGuard: githubConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createGithubConnector;
