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

export type SocialConnector = BaseConnector<ConnectorType.Social> & {
  getAuthorizationUri: GetAuthorizationUri;
  getUserInfo: GetUserInfo;
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
  }) satisfies ToZodObject<GoogleConnectorConfig>,
});

export type GoogleConnectorConfig = {
  clientId: string;
  clientSecret: string;
  scope?: string;
  oneTap?: GoogleOneTapConfig;
};
