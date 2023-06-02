import { conditional, assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';
import path from 'node:path';

import type { AuthorizationCodeRequest, AuthorizationUrlRequest } from '@azure/msal-node';
import { ConfidentialClientApplication, CryptoProvider } from '@azure/msal-node';
import type {
  GetAuthorizationUri,
  GetUserInfo,
  GetConnectorConfig,
  CreateConnector,
  SocialConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
  connectorDataParser,
} from '@logto/connector-kit';

import { scopes, defaultMetadata, defaultTimeout, graphAPIEndpoint } from './constant.js';
import type {
  AzureADConfig,
  AccessTokenResponse,
  UserInfoResponse,
  AuthResponse,
} from './types.js';
import {
  azureADConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

// eslint-disable-next-line @silverhand/fp/no-let
let authCodeRequest: AuthorizationCodeRequest;

// This `cryptoProvider` seems not used.
// Temporarily keep this as this is a refactor, which should not change the logics.
const cryptoProvider = new CryptoProvider();

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);

    validateConfig<AzureADConfig>(config, azureADConfigGuard);
    const { clientId, clientSecret, cloudInstance, tenantId } = config;

    const defaultAuthCodeUrlParameters: AuthorizationUrlRequest = {
      scopes,
      state,
      redirectUri,
    };

    const clientApplication = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: new URL(path.join(cloudInstance, tenantId)).toString(),
      },
    });

    const authCodeUrlParameters = {
      ...defaultAuthCodeUrlParameters,
    };

    const authCodeUrl = await clientApplication.getAuthCodeUrl(authCodeUrlParameters);

    return authCodeUrl;
  };

const getAccessToken = async (config: AzureADConfig, code: string, redirectUri: string) => {
  const codeRequest: AuthorizationCodeRequest = {
    ...authCodeRequest,
    redirectUri,
    scopes: ['User.Read'],
    code,
  };

  const { clientId, clientSecret, cloudInstance, tenantId } = config;

  const clientApplication = new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: new URL(path.join(cloudInstance, tenantId)).toString(),
    },
  });

  const authResult = await clientApplication.acquireTokenByCode(codeRequest);
  const { accessToken } = connectorDataParser<AccessTokenResponse>(
    authResult,
    accessTokenResponseGuard
  );
  assert(
    accessToken,
    new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, {
      data: accessToken,
      message: 'accessToken is empty',
    })
  );

  return { accessToken };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code, redirectUri } = connectorDataParser<AuthResponse>(
      data,
      authResponseGuard,
      ConnectorErrorCodes.General
    );

    // Temporarily keep this as this is a refactor, which should not change the logics.
    const config = await getConfig(defaultMetadata.id);
    validateConfig<AzureADConfig>(config, azureADConfigGuard);

    const { accessToken } = await getAccessToken(config, code, redirectUri);

    try {
      const httpResponse = await got.get(graphAPIEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: { request: defaultTimeout },
      });

      const parsedBody = parseJson(httpResponse.body);
      const { id, mail, displayName } = connectorDataParser<UserInfoResponse>(
        parsedBody,
        userInfoResponseGuard
      );

      return {
        id,
        email: conditional(mail),
        name: conditional(displayName),
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { statusCode } = error.response;

        throw new ConnectorError(
          statusCode === 401
            ? ConnectorErrorCodes.SocialAccessTokenInvalid
            : ConnectorErrorCodes.General,
          { data: error.response }
        );
      }

      throw error;
    }
  };

const createAzureAdConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: azureADConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createAzureAdConnector;
