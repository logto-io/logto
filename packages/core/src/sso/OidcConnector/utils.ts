import { ConnectorError, ConnectorErrorCodes, parseJson } from '@logto/connector-kit';
import { assert } from '@silverhand/essentials';
import camelcaseKeys, { type CamelCaseKeys } from 'camelcase-keys';
import { got, HTTPError } from 'got';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { z } from 'zod';

import {
  type BaseOidcConfig,
  type OidcConfigResponse,
  oidcConfigResponseGuard,
  oidcAuthorizationResponseGuard,
  oidcTokenResponseGuard,
  type OidcTokenResponse,
  idTokenProfileStandardClaimsGuard,
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
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }

    return camelcaseKeys(result.data);
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      throw new ConnectorError(ConnectorErrorCodes.General, error.response.body);
    }
    throw error;
  }
};

export const fetchToken = async (
  { tokenEndpoint, clientId, clientSecret }: BaseOidcConfig,
  data: unknown,
  redirectUri: string
): Promise<CamelCaseKeys<OidcTokenResponse>> => {
  const result = oidcAuthorizationResponseGuard.safeParse(data);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.General, result.error);
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
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }

    return camelcaseKeys(result.data);
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      throw new ConnectorError(ConnectorErrorCodes.General, error.response.body);
    }
    throw error;
  }
};

const issuedAtTimeTolerance = 60;

export const getIdTokenClaims = async (
  idToken: string,
  config: BaseOidcConfig,
  nonceFromSession?: string
) => {
  try {
    const { payload } = await jwtVerify(idToken, createRemoteJWKSet(new URL(config.jwksUri)), {
      issuer: config.issuer,
      audience: config.clientId,
    });

    if (Math.abs((payload.iat ?? 0) - Date.now() / 1000) > issuedAtTimeTolerance) {
      throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid, 'id_token is expired');
    }

    const result = idTokenProfileStandardClaimsGuard.safeParse(payload);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid, result.error);
    }

    const { data } = result;

    if (data.nonce) {
      assert(
        data.nonce === nonceFromSession,
        new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid, 'nonce claim not match')
      );
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof ConnectorError) {
      throw error;
    }
    throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid, error);
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
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }

    const { data } = result;

    return data;
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      throw new ConnectorError(ConnectorErrorCodes.General, error.response.body);
    }
    throw error;
  }
};
