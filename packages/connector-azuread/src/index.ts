import path from 'path';

import {
  ConfidentialClientApplication,
  AuthorizationCodeRequest,
  AuthorizationUrlRequest,
  CryptoProvider,
} from '@azure/msal-node';
import {
  AuthResponseParser,
  ConnectorError,
  ConnectorErrorCodes,
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnector,
  GetConnectorConfig,
  ValidateConfig,
} from '@logto/connector-schemas';
import { assert, conditional } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import { scopes, defaultMetadata, defaultTimeout, graphAPIEndpoint } from './constant';
import {
  authResponseGuard,
  AuthResponse,
  azureADConfigGuard,
  AzureADConfig,
  accessTokenResponseGuard,
  userInfoResponseGuard,
} from './types';

export { defaultMetadata } from './constant';

export default class AzureADConnector extends SocialConnector<AzureADConfig> {
  public clientApplication!: ConfidentialClientApplication;
  public authCodeUrlParams!: AuthorizationUrlRequest;

  cryptoProvider = new CryptoProvider();
  private readonly authCodeRequest!: AuthorizationCodeRequest;

  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
  }

  public validateConfig: ValidateConfig<AzureADConfig> = (config: unknown) => {
    const result = azureADConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);
    const { clientId, clientSecret, cloudInstance, tenantId } = config;

    this.authCodeUrlParams = {
      scopes,
      state,
      redirectUri,
    };

    this.clientApplication = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: new URL(path.join(cloudInstance, tenantId)).toString(),
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
      scopes: ['User.Read'],
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
    const { code, redirectUri } = await this.authResponseParser(data);
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

  protected readonly authResponseParser: AuthResponseParser<AuthResponse> = async (
    parameterObject: unknown
  ) => {
    const result = authResponseGuard.safeParse(parameterObject);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    return result.data;
  };
}
