import { z } from 'zod';

/**
 * OAuth 2.0 Client Authentication methods that are used by Clients to authenticate to the Authorization Server when using the Token Endpoint.
 */
export enum TokenEndpointAuthMethod {
  ClientSecretBasic = 'client_secret_basic',
  ClientSecretPost = 'client_secret_post',
  ClientSecretJwt = 'client_secret_jwt',
}

/*
 * Enumeration of algorithms supported for JWT signing when using client secrets.
 *
 * These "HS" algorithms (HMAC using SHA) are specifically chosen for scenarios where the
 * client authentication method is 'client_secret_jwt'. HMAC algorithms utilize the
 * client_secret as a shared symmetric key to generate a secure hash, ensuring the integrity
 * and authenticity of the JWT.
 *
 * Other types of algorithms, such as RSASSA (RS256, RS384, RS512) or ECDSA (ES256, ES384, ES512),
 * utilize asymmetric keys, are complex and requires secure key management infrastructure.
 *
 * In the 'client_secret_jwt' context, where simplicity and symmetric key usage are preferred for
 * straightforward validation by the authorization server without the need to manage or distribute
 * public keys, HMAC algorithms are more suitable.
 */
export enum ClientSecretJwtSigningAlgorithm {
  /** HMAC using SHA-256 hash algorithm */
  HS256 = 'HS256',
  /** HMAC using SHA-384 hash algorithm */
  HS384 = 'HS384',
  /** HMAC using SHA-512 hash algorithm */
  HS512 = 'HS512',
}

export const oauth2ConfigGuard = z.object({
  responseType: z.literal('code').optional().default('code'),
  grantType: z.literal('authorization_code').optional().default('authorization_code'),
  authorizationEndpoint: z.string(),
  tokenEndpoint: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  tokenEndpointAuthMethod: z
    .nativeEnum(TokenEndpointAuthMethod)
    .optional()
    .default(TokenEndpointAuthMethod.ClientSecretPost),
  clientSecretJwtSigningAlgorithm: z
    .nativeEnum(ClientSecretJwtSigningAlgorithm)
    .optional()
    .default(ClientSecretJwtSigningAlgorithm.HS256),
  scope: z.string().optional(),
});

export const oauth2AuthResponseGuard = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export type Oauth2AuthResponse = z.infer<typeof oauth2AuthResponseGuard>;

export const oauth2AccessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
});

export type Oauth2AccessTokenResponse = z.infer<typeof oauth2AccessTokenResponseGuard>;
