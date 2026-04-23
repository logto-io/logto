import { passwordPolicyGuard, type PasswordPolicy } from '@logto/core-kit';
import { type SignInExperience } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

/** The parsed password policy object. All properties are required. */
export type PasswordPolicyFormData = PasswordPolicy & {
  /**
   * The custom words separated by line breaks.
   *
   * This property is only used for UI display.
   */
  customWords: string;
  /**
   * Whether the custom words feature is enabled. Default value will be true if `rejects.words` is not empty.
   *
   * This property is only used for UI display.
   */
  isCustomWordsEnabled: boolean;
  /** Whether password expiration is enabled. */
  isPasswordExpirationEnabled: boolean;
  /** Number of days a password is valid before it expires. */
  passwordExpirationDays: number;
  /** Number of days before expiry to warn users. 0 means no reminder. */
  passwordReminderDays: number;
  /** Whether forgot password methods are configured. */
  hasForgotPasswordMethods: boolean;
};

export const passwordPolicyFormParser = {
  fromSignInExperience: ({
    passwordPolicy,
    passwordExpiration,
    forgotPasswordMethods,
  }: SignInExperience): PasswordPolicyFormData => ({
    ...passwordPolicyGuard.parse(passwordPolicy),
    customWords: passwordPolicy.rejects?.words?.join('\n') ?? '',
    isCustomWordsEnabled: Boolean(passwordPolicy.rejects?.words?.length),
    isPasswordExpirationEnabled: passwordExpiration.enabled ?? false,
    passwordExpirationDays: passwordExpiration.validPeriodDays ?? 90,
    passwordReminderDays: passwordExpiration.reminderPeriodDays ?? 0,
    hasForgotPasswordMethods: Boolean(forgotPasswordMethods?.length),
  }),
  toSignInExperience: (
    formData: PasswordPolicyFormData
  ): Pick<SignInExperience, 'passwordPolicy' | 'passwordExpiration'> => {
    const {
      isCustomWordsEnabled,
      customWords,
      isPasswordExpirationEnabled,
      passwordExpirationDays,
      passwordReminderDays,
      hasForgotPasswordMethods: _,
      ...passwordPolicy
    } = formData;

    return {
      passwordPolicy: {
        ...passwordPolicy,
        rejects: {
          ...passwordPolicy.rejects,
          words: isCustomWordsEnabled ? customWords.split('\n').filter(Boolean) : [],
        },
      },
      passwordExpiration: {
        enabled: isPasswordExpirationEnabled,
        ...(isPasswordExpirationEnabled && {
          validPeriodDays: passwordExpirationDays,
          reminderPeriodDays: passwordReminderDays,
        }),
      },
    };
  },
};

const usePasswordPolicy = () => {
  const { data, error, isLoading, mutate } = useSWR<SignInExperience, RequestError>(
    'api/sign-in-exp'
  );

  const formData = useMemo<PasswordPolicyFormData | undefined>(() => {
    if (!data) {
      return;
    }

    return passwordPolicyFormParser.fromSignInExperience(data);
  }, [data]);

  return {
    isLoading: isLoading && !error,
    mutate,
    error,
    data: formData,
  };
};

export default usePasswordPolicy;
