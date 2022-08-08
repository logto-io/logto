import { SocialConnector } from '@logto/connector-base-classes';
import {
  AuthResponseParser,
  GetAuthorizationUri,
  GetUserInfo,
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  codeDataGuard,
  CodeData,
} from '@logto/connector-types';
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

export default class GithubConnector extends SocialConnector<GithubConfig> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
    // eslint-disable-next-line unicorn/prefer-module
    this.metadataParser(__dirname);
  }

  public validateConfig(config: unknown): asserts config is GithubConfig {
    const result = githubConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      state,
      scope, // Only support fixed scope for v1.
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  public getAccessToken = async (code: string) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

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

  public getUserInfo: GetUserInfo = async (data) => {
    const { code } = await this.authResponseParser(data);
    const { accessToken } = await this.getAccessToken(code);

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

  public readonly authResponseParser: AuthResponseParser<CodeData> = async (
    parameterObject: unknown
  ) => {
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
}
