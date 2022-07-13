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
import { ZodError } from 'zod';

import { scope, defaultMetadata, jwksUri, issuer, authorizationEndpoint } from './constant';
import { appleConfigGuard, AppleConfig, dataGuard } from './types';

// TO-DO: support nonce validation
export default class AppleConnector implements SocialConnector {
  public metadata: ConnectorMetadata = defaultMetadata;
  private _configZodError: ZodError = new ZodError([]);

  private get configZodError() {
    return this._configZodError;
  }

  private set configZodError(zodError: ZodError) {
    this._configZodError = zodError;
  }

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig: ValidateConfig<AppleConfig> = (config: unknown): config is AppleConfig => {
    const result = appleConfigGuard.safeParse(config);

    if (!result.success) {
      this.configZodError = result.error;
    }

    return result.success;
  };

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const config = await this.getConfig(this.metadata.id);

    if (!this.validateConfig(config)) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, this.configZodError);
    }

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

    const config = await this.getConfig(this.metadata.id);

    if (!this.validateConfig(config)) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, this.configZodError);
    }

    const { clientId } = config;

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
