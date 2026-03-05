import type { User, UserMfaData, UserPasskeySignInData } from '@logto/schemas';
import {
  userLogtoConfigGuard,
  userMfaDataGuard,
  userMfaDataKey,
  userPasskeySignInDataGuard,
  userPasskeySignInDataKey,
} from '@logto/schemas';
import { removeUndefinedKeys } from '@silverhand/essentials';
import { z } from 'zod';

/**
 * Shared response guard schema for logto-config endpoints (account API and management API).
 *
 * Note: `mfa.enabled` is `optional` because `undefined` indicates the enabled state is unknown
 * for legacy users created before the `enabled` field was introduced.
 */
export const userLogtoConfigResponseGuard = z.object({
  mfa: z.object({
    enabled: userMfaDataGuard.shape.enabled,
    skipped: userMfaDataGuard.shape.skipped.unwrap(),
    skipMfaOnSignIn: userMfaDataGuard.shape.skipMfaOnSignIn.unwrap(),
  }),
  passkeySignIn: z.object({
    skipped: userPasskeySignInDataGuard.shape.skipped.unwrap(),
  }),
});

type UserLogtoConfigResponse = z.infer<typeof userLogtoConfigResponseGuard>;

/**
 * Build the logto-config API response body from a user's `logtoConfig` JSONB field.
 *
 * `mfa.enabled` is returned as-is (may be `undefined` for legacy users).
 * All other boolean fields default to `false` when absent.
 */
export const buildUserLogtoConfigResponse = (
  logtoConfig: User['logtoConfig']
): UserLogtoConfigResponse => {
  const { data } = userLogtoConfigGuard.safeParse(logtoConfig);
  return {
    mfa: {
      enabled: data?.[userMfaDataKey]?.enabled,
      skipped: data?.[userMfaDataKey]?.skipped ?? false,
      skipMfaOnSignIn: data?.[userMfaDataKey]?.skipMfaOnSignIn ?? false,
    },
    passkeySignIn: {
      skipped: data?.[userPasskeySignInDataKey]?.skipped ?? false,
    },
  };
};

/**
 * Merge partial MFA and passkey sign-in updates into a user's existing `logtoConfig` value.
 * Only explicitly provided (non-undefined) fields are written; existing fields are preserved.
 */
export const buildUpdatedUserLogtoConfig = (
  user: Pick<User, 'logtoConfig'>,
  updates: {
    mfa?: UserMfaData;
    passkeySignIn?: UserPasskeySignInData;
  }
): User['logtoConfig'] => {
  const { data } = userLogtoConfigGuard.safeParse(user.logtoConfig);
  const { mfa = {}, passkeySignIn = {} } = updates;
  return {
    ...user.logtoConfig,
    [userMfaDataKey]: {
      ...data?.[userMfaDataKey],
      ...removeUndefinedKeys(mfa),
    },
    [userPasskeySignInDataKey]: {
      ...data?.[userPasskeySignInDataKey],
      ...removeUndefinedKeys(passkeySignIn),
    },
  };
};
