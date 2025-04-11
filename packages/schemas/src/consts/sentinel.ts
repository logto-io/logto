import type { SentinelPolicy } from '../foundations/index.js';

/**
 * The default policy for this sentinel.
 *
 * - `maxAttempts`: 5
 * - `lockoutDuration`: 10 minutes
 */
export const defaultSentinelPolicy = Object.freeze({
  maxAttempts: 5,
  lockoutDuration: 10,
} satisfies SentinelPolicy);
