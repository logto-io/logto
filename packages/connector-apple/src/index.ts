import {
  ConnectorMetadata,
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
import { appleConfigGuard, AppleConfig, dataGuard } from './types';

// TO-DO: support nonce validation
export default class AppleConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig: ValidateConfig<AppleConfig> = async (config: unknown) => {
    const result = appleConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }

    return result.data;
  };

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const rawConfig = await this.getConfig(this.metadata.id);
    const config = await this.validateConfig(rawConfig);

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

  public getUserInfo: GetUserInfo = async (data) => {
    const { id_token: idToken } = await this.authorizationCallbackHandler(data);

    if (!idToken) {
      throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid);
    }

    const rawConfig = await this.getConfig(this.metadata.id);
    const { clientId } = await this.validateConfig(rawConfig);

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

  private readonly authorizationCallbackHandler = async (parameterObject: unknown) => {
    const result = dataGuard.safeParse(parameterObject);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    return result.data;
  };
}
