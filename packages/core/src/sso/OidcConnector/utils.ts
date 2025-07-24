import { parseJson, tokenResponseGuard, type TokenResponse } from '@logto/connector-kit';
import { assert } from '@silverhand/essentials';
import camelcaseKeys, { type CamelCaseKeys } from 'camelcase-keys';
import { got, HTTPError } from 'got';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyOptions } from 'jose';
import { z, ZodError } from 'zod';

import {
  SsoConnectorConfigErrorCodes,
  SsoConnectorError,
  SsoConnectorErrorCodes,
} from '../types/error.js';
import {
  idTokenProfileStandardClaimsGuard,
  oidcAuthorizationResponseGuard,
  oidcConfigResponseGuard,
  oidcTokenResponseGuard,
  type BaseOidcConfig,
  type OidcConfigResponse,
  type OidcTokenResponse,
} from '../types/oidc.js';

/**
 * Fetch the full-list of OIDC config from the issuer. Throws error if config is invalid.
 *
 * @param issuer The issuer URL
 * @returns The full-list of OIDC config
 */
export const fetchOidcConfigRaw = async (issuer: string) => {
  const { body } = await got.get(`${issuer}/.well-known/openid-configuration`, {
    responseType: 'json',
  });

  return camelcaseKeys(oidcConfigResponseGuard.parse(body));
};

export const fetchOidcConfig = async (
  issuer: string
): Promise<CamelCaseKeys<OidcConfigResponse>> => {
  try {
    return await fetchOidcConfigRaw(issuer);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: { issuer },
        message: SsoConnectorConfigErrorCodes.InvalidConfigResponse,
        error: error.flatten(),
      });
    }

    throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
      config: { issuer },
      message: SsoConnectorConfigErrorCodes.FailToFetchConfig,
      error: error instanceof HTTPError ? error.response.body : error,
    });
  }
};

type HandleTokenExchangePayload = {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
};

export const handleTokenExchange = async (
  tokenEndpoint: string,
  { code, clientId, clientSecret, redirectUri }: HandleTokenExchangePayload
) => {
  const tokenRequestParameters = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    ...(redirectUri ? { redirect_uri: redirectUri } : {}),
    // No need to pass `client_id` and `client_secret` as it is already in the Authorization header
    // For some providers like Okta, passing `client_id` in the body while using client credentials authorization header will cause an error
  });

  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const httpResponse = await got.post(tokenEndpoint, {
    body: tokenRequestParameters.toString(),
    headers,
  });

  const result = oidcTokenResponseGuard.safeParse(parseJson(httpResponse.body));

  if (!result.success) {
    return { success: false as const, error: result.error, response: httpResponse };
  }

  return { success: true as const, data: result.data };
};

export const fetchToken = async (
  { tokenEndpoint, clientId, clientSecret }: BaseOidcConfig,
  data: unknown,
  redirectUri: string
): Promise<OidcTokenResponse> => {
  const result = oidcAuthorizationResponseGuard.safeParse(data);

  if (!result.success) {
    throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidRequestParameters, {
      url: tokenEndpoint,
      params: data,
      error: result.error.flatten(),
    });
  }

  const { code } = result.data;

  try {
    const exchangeResult = await handleTokenExchange(tokenEndpoint, {
      code,
      clientId,
      clientSecret,
      redirectUri,
    });

    if (!exchangeResult.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'Invalid token response',
        response: exchangeResult.response.body,
        error: exchangeResult.error.flatten(),
      });
    }

    return exchangeResult.data;
  } catch (error: unknown) {
    if (error instanceof SsoConnectorError) {
      throw error;
    }

    throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
      message: 'Fail to fetch token',
      error: error instanceof HTTPError ? error.response.body : error,
    });
  }
};

const issuedAtTimeTolerance = 600; // 10 minutes

export const getIdTokenClaims = async (
  idToken: string,
  config: BaseOidcConfig,
  nonceFromSession?: string,
  // Allow to pass custom options for jwt.verify
  jwtVerifyOptions?: JWTVerifyOptions
) => {
  try {
    const { payload } = await jwtVerify(idToken, createRemoteJWKSet(new URL(config.jwksUri)), {
      issuer: config.issuer,
      audience: config.clientId,
      ...jwtVerifyOptions,
    });

    if (Math.abs((payload.iat ?? 0) - Date.now() / 1000) > issuedAtTimeTolerance) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'id_token is expired',
        response: payload,
      });
    }

    const result = idTokenProfileStandardClaimsGuard.catchall(z.unknown()).safeParse(payload);

    if (!result.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'invalid id_token',
        response: payload,
      });
    }

    const { data } = result;

    if (data.nonce) {
      assert(
        data.nonce === nonceFromSession,
        new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
          message: 'nonce does not match',
        })
      );
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof SsoConnectorError) {
      throw error;
    }
    throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
      message: 'Fail to verify id_token',
      error,
    });
  }
};

export const getRawUserInfoResponse = async (accessToken: string, userinfoEndpoint: string) => {
  const httpResponse = await got.get(userinfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return httpResponse.body;
};

/**
 * Get the user info from the userinfo endpoint incase id token does not contain sufficient user claims.
 */
export const getUserInfo = async (accessToken: string, userinfoEndpoint: string) => {
  try {
    const body = await getRawUserInfoResponse(accessToken, userinfoEndpoint);

    const result = idTokenProfileStandardClaimsGuard
      .catchall(z.unknown())
      .safeParse(parseJson(body));

    if (!result.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'Invalid user info response',
        response: body,
        error: result.error.flatten(),
      });
    }

    const { data } = result;

    return data;
  } catch (error: unknown) {
    if (error instanceof SsoConnectorError) {
      throw error;
    }

    throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
      message: 'Fail to fetch user info',
      error: error instanceof HTTPError ? error.response.body : error,
    });
  }
};

export const getTokenByRefreshToken = async (
  { tokenEndpoint, clientId, clientSecret }: BaseOidcConfig,
  refreshToken: string
): Promise<TokenResponse> => {
  const tokenRequestParameters = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    const httpResponse = await got.post(tokenEndpoint, {
      body: tokenRequestParameters.toString(),
      headers,
    });

    const result = tokenResponseGuard.safeParse(parseJson(httpResponse.body));

    if (!result.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'Invalid token response',
        response: result.data,
        error: result.error.flatten(),
      });
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof SsoConnectorError) {
      throw error;
    }

    throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
      message: 'Fail to fetch token',
      error: error instanceof HTTPError ? error.response.body : error,
    });
  }
};
