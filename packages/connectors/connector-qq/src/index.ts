import { assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import {
  ConnectorError,
  ConnectorErrorCodes,
  type GetAuthorizationUri,
  type GetUserInfo,
  type SocialConnector,
  type CreateConnector,
  type GetConnectorConfig,
  parseJson,
  validateConfig,
  ConnectorType,
} from '@logto/connector-kit';

import {
  authorizationEndpoint,
  accessTokenEndpoint,
  openIdEndpoint,
  userInfoEndpoint,
  defaultMetadata,
  defaultTimeout,
} from './constant.js';
import {
  qqConfigGuard,
  type QQConfig,
  accessTokenResponseGuard,
  openIdAndUnionIdResponseGuard,
  userInfoResponseGuard,
  authorizationCallbackErrorGuard,
  authResponseGuard,
} from './types.js';

/**
 * Handles the authorization callback from the QQ OAuth 2.0 service.
 * Processes the callback parameters and returns the authorization code.
 *
 * @param parameterObject - The parameter object from the callback request.
 * @returns The parsed authorization response containing the authorization code.
 * @throws ConnectorError If the callback contains an error or is invalid.
 */
const authorizationCallbackHandler = async (parameterObject: unknown) => {
  const result = authResponseGuard.safeParse(parameterObject);

  if (!result.success) {
    const parsedError = authorizationCallbackErrorGuard.safeParse(parameterObject);

    if (!parsedError.success) {
      throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(parameterObject));
    }

    const { error, error_description } = parsedError.data;

    throw new ConnectorError(ConnectorErrorCodes.General, {
      error,
      errorDescription: error_description,
    });
  }

  return result.data;
};

/**
 * Creates the authorization URI used to redirect the user to the QQ login page.
 *
 * @param getConfig - A function to retrieve the connector configuration.
 * @returns A function that generates the QQ authorization URL.
 * @see https://wiki.connect.qq.com/%e4%bd%bf%e7%94%a8authorization_code%e8%8e%b7%e5%8f%96access_token
 */
const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri, scope: customScope }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, qqConfigGuard);

    const { clientId, scope } = config;
    const queryParameters = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: customScope ?? scope ?? 'get_user_info',
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

/**
 * Obtains the QQ access token using the authorization code.
 *
 * @param config      - QQ connector configuration, including clientId and clientSecret.
 * @param code        - The authorization code received from the QQ authorization endpoint.
 * @param redirectUri - The redirect URI used in the authorization request.
 * @returns An object containing the access token.
 * @throws ConnectorError If the request fails or the response is invalid.
 * @see https://wiki.connect.qq.com/%e4%bd%bf%e7%94%a8authorization_code%e8%8e%b7%e5%8f%96access_token
 */
export const getAccessToken = async (config: QQConfig, code: string, redirectUri: string) => {
  const { clientId: client_id, clientSecret: client_secret } = config;

  try {
    const httpResponse = await got.get(accessTokenEndpoint, {
      searchParams: {
        grant_type: 'authorization_code',
        client_id,
        client_secret,
        code,
        redirect_uri: redirectUri,
        fmt: 'json',
      },
      timeout: { request: defaultTimeout },
    });

    const result = accessTokenResponseGuard.safeParse(parseJson(httpResponse.body));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }

    const { access_token: accessToken } = result.data;

    assert(accessToken, new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));

    return { accessToken };
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      const { statusCode, body: rawBody } = error.response;

      throw new ConnectorError(ConnectorErrorCodes.General, {
        statusCode,
        body: rawBody,
      });
    }

    throw error;
  }
};

/**
 * Retrieves the user's OpenID and UnionID.
 * UnionID uniquely identifies the user across different QQ applications.
 *
 * @param accessToken - The access token obtained from getAccessToken.
 * @returns An object containing unionid and openid.
 * @throws ConnectorError If the UnionID is not found or the request fails.
 * @see https://wiki.connect.qq.com/unionid%e4%bb%8b%e7%bb%8d
 */
const getOpenIdAndUnionId = async (accessToken: string) => {
  try {
    const httpResponse = await got.get(openIdEndpoint, {
      searchParams: {
        access_token: accessToken,
        fmt: 'json',
        unionid: '1',
      },
      timeout: { request: defaultTimeout },
    });

    // QQ API returns a JSONP response, so we need to extract the JSON part
    // by removing the callback function wrapper.
    const jsonText = httpResponse.body.replace(/^callback\((.*)\);$/, '$1');
    const result = openIdAndUnionIdResponseGuard.safeParse(parseJson(jsonText));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }

    const { unionid, openid } = result.data;

    // No unionid => throw error
    if (!unionid) {
      throw new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription:
          'UnionID not found. Please make sure you have applied for UnionID permission.',
      });
    }

    return { unionid, openid };
  } catch (error: unknown) {
    // https://wiki.connect.qq.com/%e5%85%ac%e5%85%b1%e8%bf%94%e5%9b%9e%e7%a0%81%e8%af%b4%e6%98%8e
    if (error instanceof HTTPError) {
      const { statusCode, body: rawBody } = error.response;

      throw new ConnectorError(ConnectorErrorCodes.General, {
        statusCode,
        body: rawBody,
      });
    }

    throw error;
  }
};

/**
 * Retrieves user information from QQ using the obtained access token and OpenID.
 *
 * @param getConfig - A function to retrieve the connector configuration.
 * @returns A function that fetches user data from QQ.
 * @see https://wiki.connect.qq.com/openapi%e8%b0%83%e7%94%a8%e8%af%b4%e6%98%8e_oauth2-0
 */
const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data) => {
    const { code, redirectUri } = await authorizationCallbackHandler(data);

    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, qqConfigGuard);

    const { clientId } = config;
    const { accessToken } = await getAccessToken(config, code, redirectUri);
    const { unionid, openid } = await getOpenIdAndUnionId(accessToken);

    try {
      const httpResponse = await got.get(userInfoEndpoint, {
        searchParams: {
          access_token: accessToken,
          oauth_consumer_key: clientId,
          openid,
        },
        timeout: { request: defaultTimeout },
      });

      const result = userInfoResponseGuard.safeParse(parseJson(httpResponse.body));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
      }

      if (result.data.ret !== 0) {
        throw new ConnectorError(ConnectorErrorCodes.General, {
          ret: result.data.ret,
          msg: result.data.msg,
        });
      }

      const { nickname, figureurl_qq_2, figureurl_qq_1 } = result.data;

      return {
        id: unionid,
        name: nickname,
        // Here, we extract the links of the two largest (clearest) profile pictures for storage.
        avatar: figureurl_qq_2 ?? figureurl_qq_1,
        rawData: result.data,
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { statusCode, body: rawBody } = error.response;

        throw new ConnectorError(ConnectorErrorCodes.General, {
          statusCode,
          body: rawBody,
        });
      }

      throw error;
    }
  };

const createQQConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: qqConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createQQConnector;
