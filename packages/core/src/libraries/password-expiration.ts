import { type SignInExperience, type User } from '@logto/schemas';
import { differenceInDays } from 'date-fns';

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

export const verifyPasswordExpirationPolicy = (
  passwordExpiration: SignInExperience['passwordExpiration'],
  user: User
): PasswordExpirationResult => {
  if (!passwordExpiration.enabled) {
    return {
      kind: 'success',
      user,
    };
  }

  assertThat(
    passwordExpiration.validPeriodDays,
    new RequestError({
      code: 'sign_in_experiences.password_expiration_invalid_period_days',
      status: 500,
    })
  );

  const referenceDate = new Date(user.passwordUpdatedAt ?? user.createdAt);
  const passwordAgeInDays = differenceInDays(new Date(), referenceDate);

  const isPasswordExpired =
    user.isPasswordExpired || passwordAgeInDays >= passwordExpiration.validPeriodDays;

  assertThat(!isPasswordExpired, new RequestError({ code: 'password.expired', status: 422 }));

  const reminderPeriodDays = passwordExpiration.reminderPeriodDays ?? 0;
  const reminderDaysUntilExpiration = passwordExpiration.validPeriodDays - passwordAgeInDays;

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
