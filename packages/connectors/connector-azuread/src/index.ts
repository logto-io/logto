import { assert, conditional } from '@silverhand/essentials';
import { got, HTTPError } from 'got';
import path from 'node:path';

import type { AuthorizationCodeRequest, AuthorizationUrlRequest } from '@azure/msal-node';
import { ConfidentialClientApplication } from '@azure/msal-node';
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
} from '@logto/connector-kit';

import { scopes, defaultMetadata, defaultTimeout, graphAPIEndpoint } from './constant.js';
import type { AzureADConfig } from './types.js';
import {
  azureADConfigGuard,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types.js';

// eslint-disable-next-line @silverhand/fp/no-let
let authCodeRequest: AuthorizationCodeRequest;

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);

    validateConfig(config, azureADConfigGuard);
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
  const result = accessTokenResponseGuard.safeParse(authResult);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  const { accessToken } = result.data;

  assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code, redirectUri } = await authorizationCallbackHandler(data);

    // Temporarily keep this as this is a refactor, which should not change the logics.
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, azureADConfigGuard);

    const { accessToken } = await getAccessToken(config, code, redirectUri);

    try {
      const httpResponse = await got.get(graphAPIEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: { request: defaultTimeout },
      });
      const rawData = parseJson(httpResponse.body);
      const result = userInfoResponseGuard.safeParse(rawData);

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
      }

      const { id, mail, displayName } = result.data;

      return {
        id,
        email: conditional(mail),
        name: conditional(displayName),
        rawData,
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { statusCode, body: rawBody } = error.response;

        if (statusCode === 401) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
      }

      throw error;
    }
  };

const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
  }

  return result.data;
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
