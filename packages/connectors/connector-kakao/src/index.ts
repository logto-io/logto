/**
 * The Implementation of OpenID Connect of Kakao.
 * https://developers.kakao.com/docs/latest/en/kakaologin/rest-api
 */
import { conditional, assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  CreateConnector,
  GetAuthorizationUri,
  GetConnectorConfig,
  GetUserInfo,
  SocialConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  validateConfig,
  parseJson,
  connectorDataParser,
} from '@logto/connector-kit';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  defaultMetadata,
  defaultTimeout,
  userInfoEndpoint,
} from './constant.js';
import type { KakaoConfig, AccessTokenResponse, UserInfoResponse, AuthResponse } from './types.js';
import {
  accessTokenResponseGuard,
  authResponseGuard,
  kakaoConfigGuard,
  userInfoResponseGuard,
} from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<KakaoConfig>(config, kakaoConfigGuard);

    const queryParameters = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

export const getAccessToken = async (
  config: KakaoConfig,
  codeObject: { code: string; redirectUri: string }
) => {
  const { code, redirectUri } = codeObject;
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
    timeout: { request: defaultTimeout },
  });

  const parsedBody = parseJson(httpResponse.body);
  const { access_token: accessToken } = connectorDataParser<AccessTokenResponse>(
    parsedBody,
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
    const config = await getConfig(defaultMetadata.id);
    validateConfig<KakaoConfig>(config, kakaoConfigGuard);
    const { accessToken } = await getAccessToken(config, { code, redirectUri });

    try {
      const httpResponse = await got.post(userInfoEndpoint, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        timeout: { request: defaultTimeout },
      });

      const parsedBody = parseJson(httpResponse.body);
      const { id, kakao_account } = connectorDataParser<UserInfoResponse>(
        parsedBody,
        userInfoResponseGuard
      );
      const { is_email_valid, email, profile } = kakao_account ?? {
        is_email_valid: null,
        profile: null,
        email: null,
      };

      return {
        id: id.toString(),
        avatar: conditional(profile && !profile.is_default_image && profile.profile_image_url),
        email: conditional(is_email_valid && email),
        name: conditional(profile?.nickname),
      };
    } catch (error: unknown) {
      return getUserInfoErrorHandler(error);
    }
  };

const getUserInfoErrorHandler = (error: unknown) => {
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
};

const createKakaoConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: kakaoConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createKakaoConnector;
