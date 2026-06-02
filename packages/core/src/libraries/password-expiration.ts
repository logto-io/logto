import { type SignInExperience, type User } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

type PasswordExpirationReminder = {
  daysUntilExpiration: number;
};

type PasswordExpirationSuccess = {
  kind: 'success';
  user: User;
};

type PasswordExpirationReminderResult = {
  kind: 'reminder';
  user: User;
  reminder: PasswordExpirationReminder;
};

export type PasswordExpirationResult = PasswordExpirationSuccess | PasswordExpirationReminderResult;

const dayInMs = 24 * 60 * 60 * 1000;

export const verifyPasswordExpirationPolicy = (
  passwordExpiration: SignInExperience['passwordExpiration'],
  user: User
): PasswordExpirationResult => {
  if (!EnvSet.values.isDevFeaturesEnabled || !passwordExpiration.enabled) {
    return {
      kind: 'success',
      user,
    };
  }

  assertThat(
    passwordExpiration.validPeriodDays,
    new RequestError({
      code: 'sign_in_experiences.password_expiration_invalid_period_days',
      status: 422,
    })
  );

  const referenceTime = user.passwordUpdatedAt ?? user.createdAt;
  const expiresAt = referenceTime + passwordExpiration.validPeriodDays * dayInMs;

  const isPasswordExpired = user.isPasswordExpired || Date.now() >= expiresAt;

  assertThat(!isPasswordExpired, new RequestError({ code: 'password.expired', status: 422 }));

  const { reminderPeriodDays } = passwordExpiration;
  const reminderDaysUntilExpiration = Math.ceil((expiresAt - Date.now()) / dayInMs);

  const isInReminderWindow =
    reminderPeriodDays > 0 && reminderDaysUntilExpiration <= reminderPeriodDays;

  if (!isInReminderWindow) {
    return {
      kind: 'success',
      user,
    };
  }

  return {
    kind: 'reminder',
    user,
    reminder: {
      daysUntilExpiration: reminderDaysUntilExpiration,
    },
  };
};
