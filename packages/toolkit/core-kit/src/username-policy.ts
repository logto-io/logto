import { z } from 'zod';

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
