import { z } from 'zod';

/**
 * The key for MFA-related data in user's logto_config
 */
export const userMfaDataKey = 'mfa';

/*
 * The key for passkey sign-in data in user's logto_config
 */
export const userPasskeySignInDataKey = 'passkey_sign_in';

/**
 * Schema for MFA-related data stored in user's logto_config
 */
export const userMfaDataGuard = z.object({
  /**
   * Whether the user has actively enabled/bound MFA factors
   */
  enabled: z.boolean().optional(),
  /**
   * Whether the user has skipped MFA binding flow
   */
  skipped: z.boolean().optional(),
  /**
   * Whether the user has skipped MFA verification on sign-in
   *
   * Users can manually disable MFA verification requirement for sign-in,
   * but if the MFA policy is set to mandatory, this setting will be ignored.
   */
  skipMfaOnSignIn: z.boolean().optional(),
});

export type UserMfaData = z.infer<typeof userMfaDataGuard>;

/**
 * Schema for passkey sign-in related data stored in user's logto_config
 */
export const userPasskeySignInDataGuard = z.object({
  /**
   * Whether the user has skipped binding passkey for sign-in persistently
   */
  skipped: z.boolean().optional(),
});

export type UserPasskeySignInData = z.infer<typeof userPasskeySignInDataGuard>;

/**
 * Schema for user's logto_config field
 */
export const userLogtoConfigGuard = z.object({
  [userMfaDataKey]: userMfaDataGuard.optional(),
  [userPasskeySignInDataKey]: userPasskeySignInDataGuard.optional(),
});

export type UserLogtoConfig = z.infer<typeof userLogtoConfigGuard>;
