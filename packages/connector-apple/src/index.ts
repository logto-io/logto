import {
  GetAuthorizationUri,
  GetUserInfo,
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  validateConfig,
  CreateConnector,
  SocialConnector,
  ConnectorType,
} from '@logto/connector-core';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { scope, defaultMetadata, jwksUri, issuer, authorizationEndpoint } from './constant';
import { appleConfigGuard, AppleConfig, dataGuard } from './types';

// TO-DO: support nonce validation

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);

    validateConfig<AppleConfig>(config, appleConfigGuard);

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

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { id_token: idToken } = await authorizationCallbackHandler(data);

    if (!idToken) {
      throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid);
    }

    const config = await getConfig(defaultMetadata.id);
    validateConfig<AppleConfig>(config, appleConfigGuard);

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

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = dataGuard.safeParse(parameterObject);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  return result.data;
};

const createAppleConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: appleConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createAppleConnector;
