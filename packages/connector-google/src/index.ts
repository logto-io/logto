/**
 * The Implementation of OpenID Connect of Google Identity Platform.
 * https://developers.google.com/identity/protocols/oauth2/openid-connect
 */
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
import { conditional, assert } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  scope,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant';
import {
  googleConfigGuard,
  GoogleConfig,
  accessTokenResponseGuard,
  userInfoResponseGuard,
} from './types';

export default class GoogleConnector implements SocialConnectorInstance<GoogleConfig> {
  public metadata: ConnectorMetadata = defaultMetadata;
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

  public validateConfig(config: unknown): asserts config is GoogleConfig {
    const result = googleConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public getAuthorizationUri: GetAuthorizationUri = async ({ state, redirectUri }) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  public getAccessToken = async (code: string, redirectUri: string) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    const { clientId, clientSecret } = config;

    // Note：Need to decodeURIComponent on code
    // https://stackoverflow.com/questions/51058256/google-api-node-js-invalid-grant-malformed-auth-code
    const httpResponse = await got.post(accessTokenEndpoint, {
      form: {
        code: decodeURIComponent(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      timeout: defaultTimeout,
    });

    const result = accessTokenResponseGuard.safeParse(JSON.parse(httpResponse.body));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
    }

    const { access_token: accessToken } = result.data;

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken };
  };

  public getUserInfo: GetUserInfo = async (data) => {
    const { code, redirectUri } = await this.authorizationCallbackHandler(data);
    const { accessToken } = await this.getAccessToken(code, redirectUri);

    try {
      const httpResponse = await got.post(userInfoEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: defaultTimeout,
      });

      const result = userInfoResponseGuard.safeParse(JSON.parse(httpResponse.body));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
      }

      const { sub: id, picture: avatar, email, email_verified, name } = result.data;

      return {
        id,
        avatar,
        email: conditional(email_verified && email),
        name,
      };
    } catch (error: unknown) {
      return this.getUserInfoErrorHandler(error);
    }
  };

  private readonly authorizationCallbackHandler = async (parameterObject: unknown) => {
    const result = codeWithRedirectDataGuard.safeParse(parameterObject);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    return result.data;
  };

  private readonly getUserInfoErrorHandler = (error: unknown) => {
    if (error instanceof HTTPError) {
      const { statusCode, body: rawBody } = error.response;

      if (statusCode === 401) {
        throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
      }

      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
    }

    throw error;
  };
}
