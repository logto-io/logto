import {
  ConnectorMetadata,
  GetAccessToken,
  GetAuthorizationUri,
  ValidateConfig,
  GetUserInfo,
  ConnectorError,
  ConnectorErrorCodes,
  SocialConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import got, { RequestError as GotRequestError } from 'got';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  scope,
  userInfoEndpoint,
  githubConfigGuard,
  GithubConfig,
  defaultMetadata,
  defaultTimeout,
} from './constant';

export class GithubConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  public readonly getConfig: GetConnectorConfig<GithubConfig>;

  constructor(getConnectorConfig: GetConnectorConfig<GithubConfig>) {
    this.getConfig = getConnectorConfig;
  }

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = githubConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
    const config = await this.getConfig(this.metadata.target, this.metadata.platform);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      state,
      scope, // Only support fixed scope for v1.
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  getAccessToken: GetAccessToken = async (code) => {
    type AccessTokenResponse = {
      access_token: string;
      scope: string;
      token_type: string;
    };

    const { clientId: client_id, clientSecret: client_secret } = await this.getConfig(
      this.metadata.target,
      this.metadata.platform
    );

    const { access_token: accessToken } = await got
      .post({
        url: accessTokenEndpoint,
        json: {
          client_id,
          client_secret,
          code,
        },
        timeout: defaultTimeout,
      })
      .json<AccessTokenResponse>();

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken };
  };

  public getUserInfo: GetUserInfo = async (accessTokenObject) => {
    type UserInfoResponse = {
      id: number;
      avatar_url?: string;
      email?: string;
      name?: string;
    };

    const { accessToken } = accessTokenObject;

    try {
      const {
        id,
        avatar_url: avatar,
        email,
        name,
      } = await got
        .get(userInfoEndpoint, {
          headers: {
            authorization: `token ${accessToken}`,
          },
          timeout: defaultTimeout,
        })
        .json<UserInfoResponse>();

      return {
        id: String(id),
        avatar,
        email,
        name,
      };
    } catch (error: unknown) {
      if (error instanceof GotRequestError && error.response?.statusCode === 401) {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
      }
      throw error;
    }
  };
}
