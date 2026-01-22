import type * as hook from './hook.js';
import type * as interaction from './interaction.js';
import type * as jwtCustomizer from './jwt-customizer.js';
import type * as saml from './saml.js';
import type * as token from './token.js';

export * as interaction from './interaction.js';
export * as token from './token.js';
export * as hook from './hook.js';
export * as jwtCustomizer from './jwt-customizer.js';
export * as saml from './saml.js';

/** Fallback for empty or unrecognized log keys. */
export const LogKeyUnknown = 'Unknown';

export type InteractionLogKey = interaction.LogKey;
export type TokenLogKey = token.LogKey;
export type WebhookLogKey = hook.LogKey;
export type JwtCustomizerLogKey = jwtCustomizer.LogKey;
export type SamlLogKey = saml.LogKey;

/**
 * The union type of all available audit log keys.
 *
 * - All user-facing audit log keys should be included here.
 * - Webhook log keys are excluded.
 */
export type AuditLogKey =
  | typeof LogKeyUnknown
  | InteractionLogKey
  | TokenLogKey
  | SamlLogKey
  | JwtCustomizerLogKey;

/**
 * The union type of all available log keys.
 * Note duplicate keys are allowed but should be avoided.
 **/
export type LogKey = AuditLogKey | WebhookLogKey;

export type AuditLogPrefix =
  | interaction.Prefix
  | token.Type
  | saml.Prefix
  | jwtCustomizer.Prefix
  | typeof LogKeyUnknown;

export type WebhookLogPrefix = hook.Type;
