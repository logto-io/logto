import { z } from 'zod';

import { usernameRegEx } from './regex.js';

/** Per-tenant username policy: case sensitivity, length bounds, and allowed character classes. */
export type UsernamePolicy = {
  caseSensitive: boolean;
  /** Integer in [1, 128], inclusive. */
  minLength: number;
  /** Integer in [1, 128], inclusive. Must be >= minLength. */
  maxLength: number;
  /** At least one of lowercase, uppercase, or underscore must be enabled (see usernamePolicyGuard). */
  allowedChars: {
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    underscore: boolean;
  };
};

export const usernamePolicyGuard = z
  .object({
    caseSensitive: z.boolean(),
    minLength: z.number().int().min(1).max(128),
    maxLength: z.number().int().min(1).max(128),
    allowedChars: z.object({
      lowercase: z.boolean(),
      uppercase: z.boolean(),
      numbers: z.boolean(),
      underscore: z.boolean(),
    }),
  })
  .refine((policy) => policy.minLength <= policy.maxLength, {
    message: 'Minimum length cannot exceed maximum length.',
    path: ['maxLength'],
  })
  // Messages are full sentences on purpose: koaGuard returns them verbatim in the 400 response,
  // so a Management API caller posting an invalid policy reads exactly why.
  .refine(
    (policy) =>
      policy.allowedChars.lowercase ||
      policy.allowedChars.uppercase ||
      policy.allowedChars.underscore,
    {
      message:
        'At least one of lowercase, uppercase, or underscore must be enabled. Usernames cannot start with a number, so numbers alone are not allowed.',
      path: ['allowedChars'],
    }
  ) satisfies z.ZodType<UsernamePolicy>;

/**
 * Mirrors current username behavior so the policy is a no-op when unset: `usernameRegEx` charset
 * (all classes), length 1-128 (`z.string().min(1)` + `users.username varchar(128)`), case-sensitive
 * (the `CASE_SENSITIVE_USERNAME` env default).
 */
export const defaultUsernamePolicy: UsernamePolicy = Object.freeze({
  caseSensitive: true,
  minLength: 1,
  maxLength: 128,
  allowedChars: Object.freeze({
    lowercase: true,
    uppercase: true,
    numbers: true,
    underscore: true,
  }),
});

export type UsernameViolation =
  | 'required'
  | 'starts_with_number'
  | 'invalid_charset_hard'
  | 'too_short'
  | 'too_long'
  | 'uppercase_not_allowed'
  | 'lowercase_not_allowed'
  | 'numbers_not_allowed'
  | 'underscore_not_allowed';

/**
 * The always-on baseline, independent of any per-tenant policy: non-empty, no leading digit, and
 * matching the existing `usernameRegEx` charset. Applies to admin writes too.
 */
export const validateUsernameHardFloor = (username: string): UsernameViolation | undefined => {
  if (username.length === 0) {
    return 'required';
  }
  if (/^\d/.test(username)) {
    return 'starts_with_number';
  }
  if (!usernameRegEx.test(username)) {
    return 'invalid_charset_hard';
  }
};

const checkAllowedChars = (
  username: string,
  allowedChars: UsernamePolicy['allowedChars']
): UsernameViolation | undefined => {
  if (!allowedChars.uppercase && /[A-Z]/.test(username)) {
    return 'uppercase_not_allowed';
  }
  if (!allowedChars.lowercase && /[a-z]/.test(username)) {
    return 'lowercase_not_allowed';
  }
  if (!allowedChars.numbers && /\d/.test(username)) {
    return 'numbers_not_allowed';
  }
  if (!allowedChars.underscore && username.includes('_')) {
    return 'underscore_not_allowed';
  }
};

/** Returns the first violation against the hard floor then the per-tenant policy, or undefined. */
export const validateUsernameAgainstPolicy = (
  username: string,
  policy: UsernamePolicy
): UsernameViolation | undefined => {
  const hardFloor = validateUsernameHardFloor(username);
  if (hardFloor) {
    return hardFloor;
  }

  if (username.length < policy.minLength) {
    return 'too_short';
  }
  if (username.length > policy.maxLength) {
    return 'too_long';
  }

  return checkAllowedChars(username, policy.allowedChars);
};
