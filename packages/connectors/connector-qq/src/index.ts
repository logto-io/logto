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

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, qqConfigGuard);

    const { clientId, scope } = config;
    const queryParameters = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: scope ?? 'get_user_info',
    });

    return `${authorizationEndpoint}?${queryParameters.toString()}`;
  };

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

      // Ok?
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
