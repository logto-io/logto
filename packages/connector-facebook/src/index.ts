/**
 * Reference: Manually Build a Login Flow
 * https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
 */

import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  GetAccessToken,
  GetAuthorizationUri,
  GetUserInfo,
  ValidateConfig,
  SocialConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
  facebookConfigGuard,
  FacebookConfig,
} from './constant';

export class FacebookConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  public readonly getConfig: GetConnectorConfig<FacebookConfig>;

  constructor(getConnectorConfig: GetConnectorConfig<FacebookConfig>) {
    this.getConfig = getConnectorConfig;
  }

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = facebookConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
    const config = await this.getConfig(this.metadata.id);

    return `${authorizationEndpoint}?${stringify({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope, // Only support fixed scope for v1.
    })}`;
  };

  public getAccessToken: GetAccessToken = async (code, redirectUri) => {
    type AccessTokenResponse = {
      access_token: string;
      token_type: string;
      expires_in: number;
    };

    const { clientId: client_id, clientSecret: client_secret } = await this.getConfig(
      this.metadata.id
    );

    const { access_token: accessToken } = await got
      .get(accessTokenEndpoint, {
        searchParams: {
          code,
          client_id,
          client_secret,
          redirect_uri: redirectUri,
        },
        timeout: defaultTimeout,
      })
      .json<AccessTokenResponse>();

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken };
  };

  public getUserInfo: GetUserInfo = async (accessTokenObject) => {
    type UserInfoResponse = {
      id: string;
      email?: string;
      name?: string;
      picture?: { data: { url: string } };
    };

    const { accessToken } = accessTokenObject;

    try {
      const { id, email, name, picture } = await got
        .get(userInfoEndpoint, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          searchParams: {
            fields: 'id,name,email,picture',
          },
          timeout: defaultTimeout,
        })
        .json<UserInfoResponse>();

      return {
        id,
        avatar: picture?.data.url,
        email,
        name,
      };
    } catch (error: unknown) {
      if (error instanceof GotRequestError && error.response?.statusCode === 400) {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
      }
      throw error;
    }
  };
}
