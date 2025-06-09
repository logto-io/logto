/**
 * This file defines the data types and guards for verification records in Logto.
 * We keep these definitions in @logto/schemas to ensure it can be shared accross different packages.
 *
 * Check {@link @logto/core/src/routes/experience/classes/verifications} for the implementation of verification records.
 */

export * from './verification-type.js';
export * from './backup-code-verification.js';
export * from './code-verification.js';
export * from './enterprise-sso-verification.js';
export * from './new-password-identity-verification.js';
export * from './one-time-token-verification.js';
export * from './password-verification.js';
export * from './social-verification.js';
export * from './totp-verification.js';
export * from './web-authn-verification.js';
