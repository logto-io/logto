// MARK: Social connector
import { type Optional } from '@silverhand/essentials';
import { type Json } from '@withtyped/server';
import { z } from 'zod';

import { type ToZodObject, type BaseConnector, type ConnectorType } from './foundation.js';

// Ref: `prompt` in https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
export enum OidcPrompt {
  None = 'none',
  Login = 'login',
  Consent = 'consent',
  SelectAccount = 'select_account',
}

export type OidcPrompts = OidcPrompt[];

export const oidcPromptsGuard: z.ZodType<Optional<OidcPrompts>> = z
  .nativeEnum(OidcPrompt)
  .array()
  .optional();

// This type definition is for SAML connector
export type ValidateSamlAssertion = (
  assertion: Record<string, unknown>,
  getSession: GetSession,
  setSession: SetSession
) => Promise<string>;

export type GetAuthorizationUri = (
  payload: {
    state: string;
    redirectUri: string;
    connectorId: string;
    connectorFactoryId: string;
    jti: string;
    headers: { userAgent?: string };
    scope?: string;
  },
  setSession: SetSession
) => Promise<string>;

// Copied from https://github.com/colinhacks/zod#json-type
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const jsonGuard: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonGuard), z.record(jsonGuard)])
);

export const jsonObjectGuard = z.record(jsonGuard);

/**
 * Normalized social user info that can be used in the system. The raw data returned from the
 * social provider is also included in the `rawData` field.
 */
export type SocialUserInfo = {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
  rawData?: Json;
};

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  rawData: jsonGuard.optional(),
}) satisfies z.ZodType<SocialUserInfo>;

export type GetUserInfo = (data: unknown, getSession: GetSession) => Promise<SocialUserInfo>;

export const connectorSessionGuard = z
  .object({
    nonce: z.string(),
    redirectUri: z.string(),
    connectorId: z.string(),
    connectorFactoryId: z.string(),
    jti: z.string(),
    state: z.string(),
  })
  .partial()
  // Accept arbitrary unspecified keys so developers who can not publish @logto/connector-kit can more flexibly utilize connector session.
  .catchall(z.unknown());

export type ConnectorSession = z.infer<typeof connectorSessionGuard>;

export type GetSession = () => Promise<ConnectorSession>;

export type SetSession = (storage: ConnectorSession) => Promise<void>;

/**
 * Generic response type for OAuth 2.0 and OIDC based social connectors' token endpoint.
 *
 * @remarks
 * Some social connector may not follow the exact format, need to be standardized at the connector level.
 */
export type TokenResponse = {
  /** Only applicable to OIDC. */
  id_token?: string;
  access_token?: string;
  refresh_token?: string;
  /** Some providers like Azure may return expires_in as a string. */
  expires_in?: number | string;
  scope?: string;
  token_type?: string;
};

export const tokenResponseGuard = z.object({
  id_token: z.string().optional(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  expires_in: z.number().or(z.string()).optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
}) satisfies ToZodObject<TokenResponse>;

export type GetTokenResponseAndUserInfo = (
  data: unknown,
  getSession: GetSession
) => Promise<{
  tokenResponse?: TokenResponse;
  userInfo: SocialUserInfo;
}>;

export type GetAccessTokenByRefreshToken = (refreshToken: string) => Promise<TokenResponse>;

export type SocialConnector = BaseConnector<ConnectorType.Social> & {
  getAuthorizationUri: GetAuthorizationUri;
  getUserInfo: GetUserInfo;
  /**
   * A function that retrieves the token response and user info from the social provider.
   *
   * @remarks
   * If the social connector has token storage enabled, use this function to retrieve the token response,
   * otherwise, use `getUserInfo` to retrieve the user info directly.
   */
  getTokenResponseAndUserInfo?: GetTokenResponseAndUserInfo;
  /**
   * @remarks
   * If the social connector has token storage enabled,
   * this function can be used to retrieve the access token by the refresh token.
   */
  getAccessTokenByRefreshToken?: GetAccessTokenByRefreshToken;
  validateSamlAssertion?: ValidateSamlAssertion;
};

/**
 * The configuration object for Google One Tap.
 *
 * @see {@link https://developers.google.com/identity/gsi/web/reference/html-reference | Sign In With Google HTML API reference}
 */
export type GoogleOneTapConfig = {
  isEnabled?: boolean;
  autoSelect?: boolean;
  closeOnTapOutside?: boolean;
  itpSupport?: boolean;
};

export const googleOneTapConfigGuard = z.object({
  isEnabled: z.boolean().optional(),
  autoSelect: z.boolean().optional(),
  closeOnTapOutside: z.boolean().optional(),
  itpSupport: z.boolean().optional(),
}) satisfies ToZodObject<GoogleOneTapConfig>;

/**
 * An object that contains the configuration for the official Google connector.
 *
 * @remarks
 * Unlike other connectors, the Google connector supports Google One Tap which needs additional
 * configuration and special handling in our system. So we put the constants and configuration
 * in this package for reusability, rather than hardcoding them in our system.
 *
 * Other connectors should not follow this pattern unless there is a strong reason to do so.
 */
export const GoogleConnector = Object.freeze({
  /** The target of Google connectors. */
  target: 'google',
  /** The factory ID of the official Google connector. */
  factoryId: 'google-universal',
  // TODO: update google connector as well, keep it unchanged for now since it's out of scope.
  /**
   * The URI of the Google JWKS. Used to verify the Google-issued JWT.
   * @see {@link https://developers.google.com/identity/gsi/web/guides/verify-google-id-token | Verify the Google ID token on your server side}
   */
  jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
  /** The issuers of the Google JWKS. Used to verify the Google-issued JWT. */
  issuer: ['https://accounts.google.com', 'accounts.google.com'],
  oneTapParams: Object.freeze({
    /** The parameter Google One Tap uses to prevent CSRF attacks. */
    csrfToken: 'g_csrf_token',
    /** The parameter Google One Tap uses to carry the ID token. */
    credential: 'credential',
  }),
  configGuard: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    scope: z.string().optional(),
    prompts: oidcPromptsGuard,
    oneTap: googleOneTapConfigGuard.optional(),
    offlineAccess: z.boolean().optional(),
  }) satisfies ToZodObject<GoogleConnectorConfig>,
});

export type GoogleConnectorConfig = {
  clientId: string;
  clientSecret: string;
  scope?: string;
  oneTap?: GoogleOneTapConfig;
  /**
   * Whether to request offline access. If set to true, the connector will request a refresh token
   * @link https://developers.google.com/identity/protocols/oauth2/web-server#offline
   */
  offlineAccess?: boolean;
};

/**
 * Checks if the given social provider data is from Google One Tap.
 *
 * Google One Tap data can come from:
 * 1. Logto's built-in Google One Tap button (sign-in experience).
 * 2. An external Google One Tap button (added by the application itself).
 *
 * To check specifically for external One Tap, use `isExternalGoogleOneTap`.
 * @param data - The data from the social provider.
 * @returns Whether the data is from Google One Tap.
 */
export const isGoogleOneTap = (data: Record<string, unknown>) => {
  return Boolean(data[GoogleConnector.oneTapParams.credential]);
};

/**
 * Checks if the given social provider data is from an external Google One Tap button
 * (not Logto's sign-in experience).
 *
 * External Google One Tap data does not include a CSRF token, so different handling
 * and security measures are required.
 *
 * @param data - The data from the social provider.
 * @returns Whether the data is from external Google One Tap.
 */
export const isExternalGoogleOneTap = (data: Record<string, unknown>) => {
  return isGoogleOneTap(data) && !data[GoogleConnector.oneTapParams.csrfToken];
};

export const logtoGoogleOneTapCookieKey = '_logto_google_one_tap_credential';
