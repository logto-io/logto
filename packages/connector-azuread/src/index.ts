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
  ConnectorMetadata,
  Connector,
  SocialConnectorInstance,
  GetConnectorConfig,
  codeWithRedirectDataGuard,
} from '@logto/connector-types';
import { assert, conditional } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import { scopes, defaultMetadata, defaultTimeout, graphAPIEndpoint } from './constant';
import {
  azureADConfigGuard,
  AzureADConfig,
  accessTokenResponseGuard,
  userInfoResponseGuard,
} from './types';

export default class AzureADConnector implements SocialConnectorInstance<AzureADConfig> {
  public metadata: ConnectorMetadata = defaultMetadata;

  public clientApplication!: ConfidentialClientApplication;
  public authCodeUrlParams!: AuthorizationUrlRequest;

  cryptoProvider = new CryptoProvider();
  private readonly authCodeRequest!: AuthorizationCodeRequest;

  private _connector?: Connector;

  public get connector() {
    if (!this._connector) {
      throw new ConnectorError(ConnectorErrorCodes.General);
    }

    return this._connector;
  }

  public set connector(input: Connector) {
    this._connector = input;
  }

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig(config: unknown): asserts config is AzureADConfig {
    const result = azureADConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);
    const { clientId, clientSecret, cloudInstance, tennantId } = config;

    this.authCodeUrlParams = {
      scopes,
      state,
      redirectUri,
    };

    this.clientApplication = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: cloudInstance + tennantId,
      },
    });

    const authCodeUrlParameters = {
      ...this.authCodeUrlParams,
    };

    const authCodeUrl = await this.clientApplication.getAuthCodeUrl(authCodeUrlParameters);

    return authCodeUrl;
  };

  public getAccessToken = async (code: string, redirectUri: string) => {
    const codeRequest = {
      ...this.authCodeRequest,
      redirectUri,
      scopes: [],
      code,
    };

    const authResult = await this.clientApplication.acquireTokenByCode(codeRequest);

    const result = accessTokenResponseGuard.safeParse(authResult);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
    }

    const { accessToken } = result.data;

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken };
  };

  public getUserInfo: GetUserInfo = async (data) => {
    const { code, redirectUri } = await this.authorizationCallbackHandler(data);
    const { accessToken } = await this.getAccessToken(code, redirectUri);

    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    try {
      const httpResponse = await got.get(graphAPIEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: defaultTimeout,
      });

      const result = userInfoResponseGuard.safeParse(JSON.parse(httpResponse.body));

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

  private readonly authorizationCallbackHandler = async (parameterObject: unknown) => {
    const result = codeWithRedirectDataGuard.safeParse(parameterObject);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    return result.data;
  };
}
