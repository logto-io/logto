/**
 * Reference: Manually Build a Login Flow
 * https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
 */

import { SocialConnectorInstance } from '@logto/connector-base-classes';
import {
  AuthResponseParser,
  ConnectorError,
  ConnectorErrorCodes,
  GetAuthorizationUri,
  GetUserInfo,
  GetConnectorConfig,
  codeWithRedirectDataGuard,
  CodeWithRedirectData,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
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
  authorizationCallbackErrorGuard,
  facebookConfigGuard,
  accessTokenResponseGuard,
  FacebookConfig,
  userInfoResponseGuard,
} from './types';

export default class FacebookConnector<T> extends SocialConnectorInstance<FacebookConfig, T> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
    this.metadataParser();
  }

  public validateConfig(config: unknown): asserts config is FacebookConfig {
    const result = facebookConfigGuard.safeParse(config);

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
      scope, // Only support fixed scope for v1.
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

  public getAccessToken = async (code: string, redirectUri: string) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    const { clientId: client_id, clientSecret: client_secret } = config;

    const httpResponse = await got.get(accessTokenEndpoint, {
      searchParams: {
        code,
        client_id,
        client_secret,
        redirect_uri: redirectUri,
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
    const { code, redirectUri } = await this.authResponseParser(data);
    const { accessToken } = await this.getAccessToken(code, redirectUri);

    try {
      const httpResponse = await got.get(userInfoEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        searchParams: {
          fields: 'id,name,email,picture',
        },
        timeout: defaultTimeout,
      });

      const result = userInfoResponseGuard.safeParse(JSON.parse(httpResponse.body));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
      }

      const { id, email, name, picture } = result.data;

      return {
        id,
        avatar: picture?.data.url,
        email,
        name,
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { statusCode, body: rawBody } = error.response;

        if (statusCode === 400) {
          throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
        }

        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(rawBody));
      }

      throw error;
    }
  };

  public readonly authResponseParser: AuthResponseParser<CodeWithRedirectData> = async (
    parameterObject: unknown
  ) => {
    const result = codeWithRedirectDataGuard.safeParse(parameterObject);

    if (result.success) {
      return result.data;
    }

    const parsedError = authorizationCallbackErrorGuard.safeParse(parameterObject);

    if (!parsedError.success) {
      throw new ConnectorError(
        ConnectorErrorCodes.InvalidResponse,
        JSON.stringify(parameterObject)
      );
    }

    const { error, error_code, error_description, error_reason } = parsedError.data;

    if (error === 'access_denied') {
      throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, error_description);
    }

    throw new ConnectorError(ConnectorErrorCodes.General, {
      error,
      error_code,
      errorDescription: error_description,
      error_reason,
    });
  };
}
