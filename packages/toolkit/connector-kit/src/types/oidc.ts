import { z } from 'zod';

export const basicOidcConnectorConfigGuard = z.object({
  issuer: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
});

export const oidcConnectorConfigGuard = basicOidcConnectorConfigGuard.merge(
  z.object({
    authorizationEndpoint: z.string(),
    tokenEndpoint: z.string(),
    userinfoEndpoint: z.string(),
    jwksUri: z.string(),
    scope: z.string().optional(),
  })
);

export type OidcConfig = z.infer<typeof oidcConnectorConfigGuard>;

export type GetOidcConfig = () => Promise<OidcConfig>;

export const oidcConfigResponseGuard = z.object({
  authorization_endpoint: z.string(),
  token_endpoint: z.string(),
  userinfo_endpoint: z.string(),
  jwks_uri: z.string(),
  issuer: z.string(),
});

export const oidcAuthorizationResponseGuard = z.object({
  code: z.string(),
  state: z.string(),
});
export type OidcAuthorizationResponse = z.infer<typeof oidcAuthorizationResponseGuard>;

export const oidcTokenResponseGuard = z.object({
  id_token: z.string(),
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  code: z.string().optional(),
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
