import { z } from 'zod';

/**
 * The key for MFA-related data in user's logto_config
 */
export const userMfaDataKey = 'mfa';

/**
 * Schema for MFA-related data stored in user's logto_config
 */
export const userMfaDataGuard = z.object({
  skipped: z.boolean().optional(),
  skipMfaOnSignIn: z.boolean().optional(),
});

export type UserMfaData = z.infer<typeof userMfaDataGuard>;

/**
 * Schema for user's logto_config field
 */
export const userLogtoConfigGuard = z.object({
  [userMfaDataKey]: userMfaDataGuard.optional(),
});

export type UserLogtoConfig = z.infer<typeof userLogtoConfigGuard>;
