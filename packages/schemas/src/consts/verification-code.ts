import type { VerificationCodePolicy } from '../foundations/index.js';

/**
 * The default verification code policy.
 *
 * - `expirationDuration`: 600 seconds (10 minutes)
 * - `maxRetryAttempts`: 10
 */
export const defaultVerificationCodePolicy = Object.freeze({
  expirationDuration: 600,
  maxRetryAttempts: 10,
} satisfies Required<VerificationCodePolicy>);
