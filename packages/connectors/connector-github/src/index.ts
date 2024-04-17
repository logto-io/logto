import { assert, conditional } from '@silverhand/essentials';

import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  jsonGuard,
} from '@logto/connector-kit';
import type {
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnector,
  CreateConnector,
  GetConnectorConfig,
} from '@logto/connector-kit';
import ky, { HTTPError } from 'ky';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  scope as defaultScope,
  userInfoEndpoint,
  userEmailsEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant.js';
import type { GithubConfig } from './types.js';
import {
  authorizationCallbackErrorGuard,
  githubConfigGuard,
  emailAddressGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, githubConfigGuard);
    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      state,
      scope: config.scope ?? defaultScope,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

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

export const getAccessToken = async (config: GithubConfig, codeObject: { code: string }) => {
  const { code } = codeObject;
  const { clientId: client_id, clientSecret: client_secret } = config;

  const httpResponse = await ky
    .post(accessTokenEndpoint, {
      body: new URLSearchParams({
        client_id,
        client_secret,
        code,
      }),
      timeout: defaultTimeout,
    })
    .json();

  const result = accessTokenResponseGuard.safeParse(httpResponse);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
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
    validateConfig(config, githubConfigGuard);
    const { accessToken } = await getAccessToken(config, { code });

    const authedApi = ky.create({
      timeout: defaultTimeout,
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.set('Authorization', `Bearer ${accessToken}`);
          },
        ],
      },
    });

    try {
      const [userInfo, userEmails] = await Promise.all([
        authedApi.get(userInfoEndpoint).json(),
        authedApi.get(userEmailsEndpoint).json(),
      ]);

      const userInfoResult = userInfoResponseGuard.safeParse(userInfo);
      const userEmailsResult = emailAddressGuard.array().safeParse(userEmails);

      if (!userInfoResult.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, userInfoResult.error);
      }

      if (!userEmailsResult.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, userEmailsResult.error);
      }

      const { id, avatar_url: avatar, email: publicEmail, name } = userInfoResult.data;

      return {
        id: String(id),
        avatar: conditional(avatar),
        email: conditional(
          publicEmail ??
            userEmailsResult.data.find(({ verified, primary }) => verified && primary)?.email
        ),
        name: conditional(name),
        rawData: jsonGuard.parse({
          userInfo,
          userEmails,
        }),
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { status, body: rawBody } = error.response;

        if (status === 401) {
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
    type: ConnectorType.Social,
    configGuard: githubConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createGithubConnector;
