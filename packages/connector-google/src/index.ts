/**
 * The Implementation of OpenID Connect of Google Identity Platform.
 * https://developers.google.com/identity/protocols/oauth2/openid-connect
 */
import {
  ConnectorError,
  ConnectorErrorCodes,
  GetAccessToken,
  GetAuthorizationUri,
  GetUserInfo,
  ConnectorMetadata,
  ValidateConfig,
  SocialConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { conditional, assert } from '@silverhand/essentials';
import got, { RequestError as GotRequestError } from 'got';
import { stringify } from 'query-string';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope,
  userInfoEndpoint,
  googleConfigGuard,
  GoogleConfig,
  defaultMetadata,
  defaultTimeout,
} from './constant';

export class GoogleConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  public readonly getConfig: GetConnectorConfig<GoogleConfig>;

  constructor(getConnectorConfig: GetConnectorConfig<GoogleConfig>) {
    this.getConfig = getConnectorConfig;
  }

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = googleConfigGuard.safeParse(config);

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
      scope,
    })}`;
  };

  public getAccessToken: GetAccessToken = async (code, redirectUri) => {
    type AccessTokenResponse = {
      access_token: string;
      scope: string;
      token_type: string;
    };

    const { clientId, clientSecret } = await this.getConfig(this.metadata.id);

    // Note：Need to decodeURIComponent on code
    // https://stackoverflow.com/questions/51058256/google-api-node-js-invalid-grant-malformed-auth-code
    const { access_token: accessToken } = await got
      .post(accessTokenEndpoint, {
        form: {
          code: decodeURIComponent(code),
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
        timeout: defaultTimeout,
        followRedirect: true,
      })
      .json<AccessTokenResponse>();

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken };
  };

  public getUserInfo: GetUserInfo = async (accessTokenObject) => {
    type UserInfoResponse = {
      sub: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
      email?: string;
      email_verified?: boolean;
      locale?: string;
    };

    const { accessToken } = accessTokenObject;

    try {
      const {
        sub: id,
        picture: avatar,
        email,
        email_verified,
        name,
      } = await got
        .post(userInfoEndpoint, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          timeout: defaultTimeout,
        })
        .json<UserInfoResponse>();

      return {
        id,
        avatar,
        email: conditional(email_verified && email),
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
