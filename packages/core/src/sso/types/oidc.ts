import { type CamelCaseKeys } from 'camelcase-keys';
import { z } from 'zod';

export enum RequiredOidcScope {
  OPEN_ID = 'openid',
  PROFILE = 'profile',
  EMAIL = 'email',
}

const scopeDelimiter = /[ +]/;
/**
 * Scope config processor for OIDC connector. openid scope is required to retrieve id_token
 * @see https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
 * @param {string} scope
 * @returns {string}
 *
 * @remark Forked from @logto/oidc-connector
 */
export const scopePostProcessor = (scope = '') => {
  const splitScopes = scope.split(scopeDelimiter).filter(Boolean);
  const defaultScopes = Object.values(RequiredOidcScope);
  const parsedScopes = new Set([...defaultScopes, ...splitScopes]);

  return Array.from(parsedScopes).join(' ');
};

export const basicOidcConnectorConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  issuer: z.string(),
  scope: z.string().optional(),
});

export type BasicOidcConnectorConfig = z.infer<typeof basicOidcConnectorConfigGuard>;

export const oidcConfigResponseGuard = z.object({
  authorization_endpoint: z.string(),
  token_endpoint: z.string(),
  userinfo_endpoint: z.string(),
  jwks_uri: z.string(),
  issuer: z.string(),
});

export type OidcConfigResponse = z.infer<typeof oidcConfigResponseGuard>;

export type BaseOidcConfig = CamelCaseKeys<OidcConfigResponse> & {
  clientId: string;
  clientSecret: string;
  scope: string;
};

export const oidcAuthorizationResponseGuard = z.object({
  code: z.string(),
});

export const oidcTokenResponseGuard = z.object({
  id_token: z.string(),
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  // Microsoft EntraID may return string type for expires_in
  expires_in: z.number().or(z.string()).optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

export type OidcTokenResponse = z.infer<typeof oidcTokenResponseGuard>;

// See https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims.
export const idTokenProfileStandardClaimsGuard = z.object({
  sub: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  email_verified: z.boolean().nullish(),
  phone: z.string().nullish(),
  phone_verified: z.boolean().nullish(),
  picture: z.string().nullish(),
  profile: z.string().nullish(),
  nonce: z.string().nullish(),
});
