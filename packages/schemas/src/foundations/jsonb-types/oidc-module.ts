import { validateRedirectUrl } from '@logto/core-kit';
import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';

export const oidcModelInstancePayloadGuard = z
  .object({
    userCode: z.string().optional(),
    uid: z.string().optional(),
    grantId: z.string().optional(),
  })
  /**
   * Try to use `.passthrough()` if type has been fixed.
   * https://github.com/colinhacks/zod/issues/452
   */
  .catchall(z.unknown());

export type OidcModelInstancePayload = z.infer<typeof oidcModelInstancePayloadGuard>;

export type OidcClientMetadata = {
  /**
   * The redirect URIs that the client is allowed to use.
   *
   * @see {@link https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata | OpenID Connect Dynamic Client Registration 1.0}
   */
  redirectUris: string[];
  /**
   * The post-logout redirect URIs that the client is allowed to use.
   *
   * @see {@link https://openid.net/specs/openid-connect-rpinitiated-1_0.html#ClientMetadata | OpenID Connect RP-Initiated Logout 1.0}
   */
  postLogoutRedirectUris: string[];
  /**
   * The URI for backchannel logout.
   *
   * @see {@link https://openid.net/specs/openid-connect-backchannel-1_0-final.html#BCRegistration | OpenID Connect Back-Channel Logout 1.0}
   */
  backchannelLogoutUri?: string;
  /**
   * Whether the RP requires that a `sid` (session ID) Claim be included in the Logout Token.
   *
   * @see {@link https://openid.net/specs/openid-connect-backchannel-1_0-final.html#BCRegistration | OpenID Connect Back-Channel Logout 1.0}
   */
  backchannelLogoutSessionRequired?: boolean;
  logoUri?: string;
};

export const oidcClientMetadataGuard = z.object({
  redirectUris: z
    .string()
    .refine((url) => validateRedirectUrl(url, 'web'))
    .or(z.string().refine((url) => validateRedirectUrl(url, 'mobile')))
    .array(),
  postLogoutRedirectUris: z.string().url().array(),
  backchannelLogoutUri: z.string().url().optional(),
  backchannelLogoutSessionRequired: z.boolean().optional(),
  logoUri: z.string().optional(),
}) satisfies ToZodObject<OidcClientMetadata>;

export enum CustomClientMetadataKey {
  CorsAllowedOrigins = 'corsAllowedOrigins',
  IdTokenTtl = 'idTokenTtl',
  /** @deprecated Use {@link RefreshTokenTtlInDays} instead. */
  RefreshTokenTtl = 'refreshTokenTtl',
  RefreshTokenTtlInDays = 'refreshTokenTtlInDays',
  TenantId = 'tenantId',
  /**
   * Enabling this configuration will allow Logto to always issue Refresh Tokens, regardless of whether `prompt=consent` is presented in the authentication request.
   *
   * It only works for web applications when the client allowed grant types includes `refresh_token`.
   *
   * This config is for the third-party integrations that do not strictly follow OpenID Connect standards due to some reasons (e.g. they only know OAuth, but requires a Refresh Token to be returned anyway).
   */
  AlwaysIssueRefreshToken = 'alwaysIssueRefreshToken',
  /**
   * When enabled (default), Logto will issue a new Refresh Token for token requests when 70% of the original Time to Live (TTL) has passed.
   *
   * It can be turned off for only traditional web apps for enhanced security.
   */
  RotateRefreshToken = 'rotateRefreshToken',
}

export const customClientMetadataGuard = z.object({
  [CustomClientMetadataKey.CorsAllowedOrigins]: z.string().min(1).array().optional(),
  [CustomClientMetadataKey.IdTokenTtl]: z.number().optional(),
  [CustomClientMetadataKey.RefreshTokenTtl]: z.number().optional(),
  [CustomClientMetadataKey.RefreshTokenTtlInDays]: z.number().int().min(1).max(90).optional(),
  [CustomClientMetadataKey.TenantId]: z.string().optional(),
  [CustomClientMetadataKey.AlwaysIssueRefreshToken]: z.boolean().optional(),
  [CustomClientMetadataKey.RotateRefreshToken]: z.boolean().optional(),
} satisfies Record<CustomClientMetadataKey, z.ZodType>);

/**
 * @see {@link CustomClientMetadataKey} for key descriptions.
 */
export type CustomClientMetadata = z.infer<typeof customClientMetadataGuard>;
