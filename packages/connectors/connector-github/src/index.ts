import { assert, conditional, trySafe } from '@silverhand/essentials';

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
  GetTokenResponseAndUserInfo,
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

  const { access_token } = result.data;

  assert(access_token, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return result.data;
};

const handleAuthorizationCallback = async (getConfig: GetConnectorConfig, data: unknown) => {
  const { code } = await authorizationCallbackHandler(data);
  const config = await getConfig(defaultMetadata.id);
  validateConfig(config, githubConfigGuard);
  return getAccessToken(config, { code });
};

const _getUserInfo = async (accessToken: string) => {
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
    /**
     * If user(s) is using GitHub Apps (instead of OAuth Apps), they can customize
     * "Account permissions" and restrict the "email addresses" visibility, and GitHub
     * hence throws error instead of returning an empty array.
     *
     * We try catch the error and return an empty array instead.
     */
    const [userInfo, userEmails = []] = await Promise.all([
      authedApi.get(userInfoEndpoint).json(),
      trySafe(authedApi.get(userEmailsEndpoint).json()),
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

const getTokenResponseAndUserInfo =
  (getConfig: GetConnectorConfig): GetTokenResponseAndUserInfo =>
  async (data) => {
    const tokenResponse = await handleAuthorizationCallback(getConfig, data);
    const userInfo = await _getUserInfo(tokenResponse.access_token);

    return {
      tokenResponse,
      userInfo,
    };
  };

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { access_token: accessToken } = await handleAuthorizationCallback(getConfig, data);
    return _getUserInfo(accessToken);
  };

const createGithubConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: githubConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
    getTokenResponseAndUserInfo: getTokenResponseAndUserInfo(getConfig),
  };
};

export default createGithubConnector;
