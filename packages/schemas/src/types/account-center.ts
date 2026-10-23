import { z } from 'zod';

/**
 * How long an end-user authentication stays recent enough for Logto-enforced sensitive
 * operations, in seconds, when the tenant has not configured one. This is also the OIDC `max_age`
 * the Account API advertises in its RFC 9470 challenge.
 */
export const defaultMaximumAuthenticationAgeInSeconds = 600;

/** The allowed range of the tenant's maximum authentication age, in seconds: 1 minute to 2 hours. */
export const maximumAuthenticationAgeInSecondsRange = Object.freeze({
  min: 60,
  max: 2 * 60 * 60,
});

export const maximumAuthenticationAgeInSecondsGuard = z
  .number()
  .int()
  .min(maximumAuthenticationAgeInSecondsRange.min)
  .max(maximumAuthenticationAgeInSecondsRange.max);
