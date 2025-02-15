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

export type AuditLogKey = typeof LogKeyUnknown | interaction.LogKey | token.LogKey | saml.LogKey;
export type WebhookLogKey = hook.LogKey;
export type JwtCustomizerLogKey = jwtCustomizer.LogKey;
export type SamlLogKey = saml.LogKey;

/**
 * The union type of all available log keys.
 * Note duplicate keys are allowed but should be avoided.
 *
 * @see {@link interaction.LogKey} for interaction log keys.
 * @see {@link token.LogKey} for token log keys.
 * @see {@link saml.LogKey} for SAML application log keys.
 **/
export type LogKey = AuditLogKey | WebhookLogKey | JwtCustomizerLogKey;
