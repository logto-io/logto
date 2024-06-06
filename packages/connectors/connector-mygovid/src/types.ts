import { z } from 'zod';

import { oauth2ConfigGuard } from '@logto/connector-oauth';

const scopeOpenid = 'openid';
export const delimiter = /[ +]/;

// Space-delimited 'scope' MUST contain 'openid', see https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
export const scopePostProcessor = (scope: string) => {
  const splitScopes = scope.split(delimiter).filter(Boolean);

  if (!splitScopes.includes(scopeOpenid)) {
    return [...splitScopes, scopeOpenid].join(' ');
  }

  return scope;
};

// See https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims.
// MyGovId is not compliant with the standard claims, we also don't care about all of them
export const myGovIdTokenProfileStandardClaimsGuard = z.object({
  sub: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  email: z.string().nullish(),
  mobile: z.string().nullish(),
  nonce: z.string().nullish(),
});

export const userProfileGuard = z.object({
  id: z.preprocess(String, z.string()),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileGuard>;

/**
 * We remove `nonce` in `authRequestOptionalConfigGuard` because it should be a randomly generated string,
 * should not be fixed in config and will be generated in Logto core according to `response_type` of authorization request.
 */
export const authRequestOptionalConfigGuard = z
  .object({
    responseMode: z.string(),
    display: z.string(),
    prompt: z.string(),
    maxAge: z.string(),
    uiLocales: z.string(),
    idTokenHint: z.string(),
    loginHint: z.string(),
    acrValues: z.string(),
  })
  .partial();

// See https://github.com/panva/jose/blob/main/docs/interfaces/jwt_verify.JWTVerifyOptions.md for details.
export const idTokenVerificationConfigGuard = z.object({ jwksUri: z.string() }).merge(
  z
    .object({
      issuer: z.string().or(z.string().array()),
      audience: z.string().or(z.string().array()),
      algorithms: z.string().array(),
      clockTolerance: z.string().or(z.number()),
      crit: z.record(z.string(), z.boolean()),
      currentDate: z.date().default(new Date()),
      maxTokenAge: z.string().or(z.number()),
      subject: z.string(),
      typ: z.string(),
    })
    .partial()
);

export type IdTokenVerificationConfig = z.infer<typeof idTokenVerificationConfigGuard>;

export const oidcConnectorConfigGuard = oauth2ConfigGuard.extend({
  // Override `scope` to ensure it contains 'openid'.
  scope: z.string().transform(scopePostProcessor),
  idTokenVerificationConfig: idTokenVerificationConfigGuard,
  authRequestOptionalConfig: authRequestOptionalConfigGuard.optional(),
  customConfig: z.record(z.string()).optional(),
});

export type OidcConnectorConfig = z.infer<typeof oidcConnectorConfigGuard>;

export const authResponseGuard = z
  .object({
    code: z.string(),
    state: z.string().optional(),
  })
  .catchall(z.string());

export type AuthResponse = z.infer<typeof authResponseGuard>;

export const accessTokenResponseGuard = z.object({
  id_token: z.string(),
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  code: z.string().optional(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;
