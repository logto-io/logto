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
import got from 'got';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  scope,
  defaultMetadata,
  defaultTimeout,
  jwksUri,
  issuer,
} from './constant';
import { appleConfigGuard, AccessTokenResponse, AppleConfig } from './types';

export default class AppleConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<AppleConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = appleConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  // Refer to: https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms
  public getAuthorizationUri: GetAuthorizationUri = async (redirectUri, state) => {
    const config = await this.getConfig(this.metadata.id);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      response_mode: 'form_post',
      state,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  // Refer to: https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens
  getAccessToken: GetAccessToken = async (code) => {
    const { clientId: client_id, clientSecret: client_secret } = await this.getConfig(
      this.metadata.id
    );

    const { access_token: accessToken, id_token: idToken } = await got
      .post(accessTokenEndpoint, {
        form: {
          code,
          client_id,
          client_secret,
          grant_type: 'authorization_code',
        },
        timeout: defaultTimeout,
      })
      .json<AccessTokenResponse>();

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken, idToken };
  };

  // Decode user info from ID token
  // Refer to: https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens
  public getUserInfo: GetUserInfo = async (accessTokenObject) => {
    const { idToken } = accessTokenObject;

    if (!idToken) {
      throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid);
    }

    const { clientId } = await this.getConfig(this.metadata.id);

    try {
      const { payload } = await jwtVerify(idToken, createRemoteJWKSet(new URL(jwksUri)), {
        issuer,
        audience: clientId,
      });

      if (!payload.sub) {
        throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid);
      }

      // Need to check data in payload
      // Refer to: https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms
      console.log(JSON.stringify(payload));

      return {
        id: payload.sub,
        // TODO: return user info
        // name: [payload.name.firstName, payload.name.lastName].join(' '),
        // email: payload.email_verified,
      };
    } catch {
      throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid);
    }
  };
}
