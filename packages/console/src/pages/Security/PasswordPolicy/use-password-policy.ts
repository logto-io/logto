import { passwordPolicyGuard, type PasswordPolicy } from '@logto/core-kit';
import {
  AlternativeSignUpIdentifier,
  ConnectorType,
  ForgotPasswordMethod,
  SignInIdentifier,
  type SignInExperience,
  type PasswordExpirationPolicy,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';
import useSWR from 'swr';

import { isDevFeaturesEnabled } from '@/consts/env';
import { type RequestError } from '@/hooks/use-api';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

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
  /** Whether some forgot password method are configured. */
  hasAvailableForgotPasswordMethod: boolean;
  /**
   * Whether sign-up requires a contact identifier (email, phone, or emailOrPhone) that every
   * account is guaranteed to have. When false, some accounts may lack any contact to receive a
   * password recovery code, so an expired password cannot be reset.
   */
  hasContactSignUpIdentifier: boolean;
};

export const passwordPolicyFormParser = {
  fromSignInExperience: ({
    passwordPolicy,
    passwordExpiration,
  }: SignInExperience): Omit<
    PasswordPolicyFormData,
    'hasAvailableForgotPasswordMethod' | 'hasContactSignUpIdentifier'
  > => ({
    ...passwordPolicyGuard.parse(passwordPolicy),
    customWords: passwordPolicy.rejects?.words?.join('\n') ?? '',
    isCustomWordsEnabled: Boolean(passwordPolicy.rejects?.words?.length),
    isPasswordExpirationEnabled: passwordExpiration.enabled ?? false,
    passwordExpirationDays: passwordExpiration.enabled ? passwordExpiration.validPeriodDays : 90,
  }),
  toSignInExperience: (
    formData: PasswordPolicyFormData
  ): Pick<SignInExperience, 'passwordPolicy'> &
    Partial<Pick<SignInExperience, 'passwordExpiration'>> => {
    const {
      isCustomWordsEnabled,
      customWords,
      isPasswordExpirationEnabled,
      passwordExpirationDays,
      hasAvailableForgotPasswordMethod: _,
      hasContactSignUpIdentifier: __,
      ...passwordPolicy
    } = formData;
    const passwordExpiration: PasswordExpirationPolicy = isPasswordExpirationEnabled
      ? {
          enabled: true,
          validPeriodDays: passwordExpirationDays,
        }
      : {
          enabled: false,
        };

    return {
      passwordPolicy: {
        ...passwordPolicy,
        rejects: {
          ...passwordPolicy.rejects,
          words: isCustomWordsEnabled ? customWords.split('\n').filter(Boolean) : [],
        },
      },
      ...conditional(isDevFeaturesEnabled && { passwordExpiration }),
    };
  },
};

const usePasswordPolicy = () => {
  const { data, error, isLoading, mutate } = useSWR<SignInExperience, RequestError>(
    'api/sign-in-exp'
  );

  const { isConnectorTypeEnabled, ready: connectorsReady } = useEnabledConnectorTypes();

  const formData = useMemo<PasswordPolicyFormData | undefined>(() => {
    if (!data) {
      return;
    }

    const { forgotPasswordMethods, signUp } = data;

    // `signUp.identifiers` only holds primary `SignInIdentifier`s; the `emailOrPhone` alternative
    // appears in `secondaryIdentifiers`. Check both so any required contact suppresses the reminder.
    const requiredSignUpIdentifiers = [
      ...signUp.identifiers,
      ...(signUp.secondaryIdentifiers?.map(({ identifier }) => identifier) ?? []),
    ];
    const hasContactSignUpIdentifier = requiredSignUpIdentifiers.some(
      (identifier) =>
        identifier === SignInIdentifier.Email ||
        identifier === SignInIdentifier.Phone ||
        identifier === AlternativeSignUpIdentifier.EmailOrPhone
    );

    const hasEmailConnector = isConnectorTypeEnabled(ConnectorType.Email);
    const hasSmsConnector = isConnectorTypeEnabled(ConnectorType.Sms);

    const hasEmailForgotPasswordMethod =
      Boolean(forgotPasswordMethods?.includes(ForgotPasswordMethod.EmailVerificationCode)) &&
      hasEmailConnector;

    const hasSmsForgotPasswordMethod =
      Boolean(forgotPasswordMethods?.includes(ForgotPasswordMethod.PhoneVerificationCode)) &&
      hasSmsConnector;

    const formData: PasswordPolicyFormData = {
      ...passwordPolicyFormParser.fromSignInExperience(data),
      hasAvailableForgotPasswordMethod: forgotPasswordMethods
        ? hasEmailForgotPasswordMethod || hasSmsForgotPasswordMethod
        : hasEmailConnector || hasSmsConnector,
      hasContactSignUpIdentifier,
    };

    return formData;
  }, [data, isConnectorTypeEnabled]);

  return {
    isLoading: (isLoading || !connectorsReady) && !error,
    mutate,
    error,
    data: formData,
  };
};

export default usePasswordPolicy;
