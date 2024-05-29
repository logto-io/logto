import { parseJson } from '@logto/connector-kit';
import { assert } from '@silverhand/essentials';
import camelcaseKeys, { type CamelCaseKeys } from 'camelcase-keys';
import { got, HTTPError } from 'got';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyOptions } from 'jose';
import { z } from 'zod';

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

export const fetchOidcConfig = async (
  issuer: string
): Promise<CamelCaseKeys<OidcConfigResponse>> => {
  try {
    const { body } = await got.get(`${issuer}/.well-known/openid-configuration`, {
      responseType: 'json',
    });

    const result = oidcConfigResponseGuard.safeParse(body);

    if (!result.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: { issuer },
        message: SsoConnectorConfigErrorCodes.InvalidConfigResponse,
        error: result.error.flatten(),
      });
    }

    return camelcaseKeys(result.data);
  } catch (error: unknown) {
    if (error instanceof SsoConnectorError) {
      throw error;
    }

    throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
      config: { issuer },
      message: SsoConnectorConfigErrorCodes.FailToFetchConfig,
      error: error instanceof HTTPError ? error.response.body : error,
    });
  }
};

export const fetchToken = async (
  { tokenEndpoint, clientId, clientSecret }: BaseOidcConfig,
  data: unknown,
  redirectUri: string
): Promise<CamelCaseKeys<OidcTokenResponse>> => {
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
    const httpResponse = await got.post({
      url: tokenEndpoint,
      form: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
    });

    const result = oidcTokenResponseGuard.safeParse(parseJson(httpResponse.body));

    if (!result.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'Invalid token response',
        response: httpResponse.body,
        error: result.error.flatten(),
      });
    }

    return camelcaseKeys(result.data);
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

    const result = idTokenProfileStandardClaimsGuard.safeParse(payload);

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

/**
 * Get the user info from the userinfo endpoint incase id token does not contain sufficient user claims.
 */
export const getUserInfo = async (accessToken: string, userinfoEndpoint: string) => {
  try {
    const httpResponse = await got.get(userinfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'json',
    });

    const result = idTokenProfileStandardClaimsGuard
      .catchall(z.unknown())
      .safeParse(httpResponse.body);

    if (!result.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'Invalid user info response',
        response: httpResponse.body,
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
