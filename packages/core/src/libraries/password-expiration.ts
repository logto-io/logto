import { type SignInExperience, type User } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

const dayInMs = 24 * 60 * 60 * 1000;

/**
 * Enforce the password expiration policy for a user after their password has been verified.
 *
 * @throws `sign_in_experiences.password_expiration_invalid_period_days` (422) when an enabled
 * policy has an invalid valid period.
 * @throws `password.expired` (422) when the user's password is past its valid period or has been
 * manually expired.
 */
export const verifyPasswordExpirationPolicy = (
  passwordExpiration: SignInExperience['passwordExpiration'],
  user: User
): void => {
  if (!EnvSet.values.isDevFeaturesEnabled || !passwordExpiration.enabled) {
    return;
  }

  assertThat(
    Number.isInteger(passwordExpiration.validPeriodDays) && passwordExpiration.validPeriodDays >= 1,
    new RequestError({
      code: 'sign_in_experiences.password_expiration_invalid_period_days',
      status: 422,
    })
  );

  // Legacy users have no `passwordUpdatedAt`; anchor them to when the policy was enabled so they
  // get a full valid period, falling back to `createdAt` only when neither is available.
  const referenceTime = user.passwordUpdatedAt ?? passwordExpiration.enabledAt ?? user.createdAt;
  const expiresAt = referenceTime + passwordExpiration.validPeriodDays * dayInMs;

  const isPasswordExpired = user.isPasswordExpired || Date.now() >= expiresAt;

  assertThat(!isPasswordExpired, new RequestError({ code: 'password.expired', status: 422 }));
};
