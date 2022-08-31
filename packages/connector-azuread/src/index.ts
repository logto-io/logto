import path from 'path';

import {
  ConfidentialClientApplication,
  AuthorizationCodeRequest,
  AuthorizationUrlRequest,
  CryptoProvider,
} from '@azure/msal-node';
import {
  ConnectorError,
  ConnectorErrorCodes,
  GetAuthorizationUri,
  GetUserInfo,
  GetConnectorConfig,
  validateConfig,
  CreateConnector,
  SocialConnector,
  ConnectorType,
  jsonSafeParse,
} from '@logto/connector-core';
import { assert, conditional } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import { scopes, defaultMetadata, defaultTimeout, graphAPIEndpoint } from './constant';
import {
  azureADConfigGuard,
  AzureADConfig,
  accessTokenResponseGuard,
  userInfoResponseGuard,
  authResponseGuard,
} from './types';

// eslint-disable-next-line @silverhand/fp/no-let
let clientApplication: ConfidentialClientApplication;
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

    // eslint-disable-next-line @silverhand/fp/no-mutation
    clientApplication = new ConfidentialClientApplication({
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

const getAccessToken = async (code: string, redirectUri: string) => {
  const codeRequest: AuthorizationCodeRequest = {
    ...authCodeRequest,
    redirectUri,
    scopes: ['User.Read'],
    code,
  };

  const authResult = await clientApplication.acquireTokenByCode(codeRequest);

  const result = accessTokenResponseGuard.safeParse(authResult);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
  }

  const { accessToken } = result.data;

  assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

  return { accessToken };
};

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code, redirectUri } = await authorizationCallbackHandler(data);
    const { accessToken } = await getAccessToken(code, redirectUri);

    // This `config` seems not used. `config` are used to initialize `clientApplication`.
    // Temporarily keep this as this is a refactor, which should not change the logics.
    const config = await getConfig(defaultMetadata.id);
    validateConfig<AzureADConfig>(config, azureADConfigGuard);

    try {
      const httpResponse = await got.get(graphAPIEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: defaultTimeout,
      });

      const result = userInfoResponseGuard.safeParse(jsonSafeParse(httpResponse.body));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
      }

      const { id, mail, displayName } = result.data;

      return {
        id,
        email: conditional(mail),
        name: conditional(displayName),
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
