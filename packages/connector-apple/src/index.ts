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
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { scope, defaultMetadata, jwksUri, issuer, authorizationEndpoint } from './constant';
import { appleConfigGuard, AppleConfig, appleDataGuard } from './types';

// TO-DO: support nonce validation
export default class AppleConnector implements SocialConnector<string> {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<AppleConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = appleConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async (state, redirectUri) => {
    const config = await this.getConfig(this.metadata.id);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms#3332113
      response_type: 'code id_token',
      response_mode: 'fragment',
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  // Directly return now. Refactor with connector interface redesign.
  getAccessToken: GetAccessToken<string> = async (code) => {
    return code;
  };

  // Extract data from JSON string.
  // Refactor with connector interface redesign.
  public getUserInfo: GetUserInfo<string> = async (data) => {
    const { id_token: idToken } = appleDataGuard.parse(JSON.parse(data));

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

      return {
        id: payload.sub,
      };
    } catch {
      throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid);
    }
  };
}
