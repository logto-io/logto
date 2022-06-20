import {
  ConnectorMetadata,
  GetAuthorizationUri,
  ValidateConfig,
  GetUserInfo,
  ConnectorError,
  ConnectorErrorCodes,
  SocialConnector,
  GetConnectorConfig,
  codeDataGuard,
} from '@logto/connector-types';
import { assert, conditional } from '@silverhand/essentials';
import got, { RequestError as GotRequestError } from 'got';
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

export default class GithubConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<GithubConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = githubConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const config = await this.getConfig(this.metadata.id);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      state,
      scope, // Only support fixed scope for v1.
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  public getAccessToken = async (code: string) => {
    const { clientId: client_id, clientSecret: client_secret } = await this.getConfig(
      this.metadata.id
    );

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
    const { code } = await this.authorizationCallbackHandler(data);
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
      if (error instanceof GotRequestError && error.response?.statusCode === 401) {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
      }
      throw error;
    }
  };

  private readonly authorizationCallbackHandler = async (parameterObject: unknown) => {
    const result = codeDataGuard.safeParse(parameterObject);

    if (result.success) {
      return result.data;
    }

    const parsedError = authorizationCallbackErrorGuard.safeParse(parameterObject);

    if (parsedError.success && parsedError.data.error === 'access_denied') {
      throw new ConnectorError(
        ConnectorErrorCodes.UnsuccessfulAuthorization,
        parsedError.data.error_description
      );
    }

    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  };
}
