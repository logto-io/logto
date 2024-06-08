import { PasswordPolicyChecker, passwordPolicyGuard } from '@logto/core-kit';
import { SignInIdentifier } from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { type VerificationCodeIdentifier } from '@/types';

export const useSieMethods = () => {
  const { experienceSettings } = useContext(PageContext);
  const socialSignInSettings = experienceSettings?.socialSignIn ?? {};
  const { identifiers, password, verify } = experienceSettings?.signUp ?? {};

  return {
    signUpMethods: identifiers ?? [],
    signUpSettings: { password, verify },
    signInMethods:
      experienceSettings?.signIn.methods.filter(
        // Filter out empty settings
        ({ password, verificationCode }) => password || verificationCode
      ) ?? [],
    socialSignInSettings,
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    ssoConnectors: experienceSettings?.ssoConnectors ?? [],
    signInMode: experienceSettings?.signInMode,
    forgotPassword: experienceSettings?.forgotPassword,
    customContent: experienceSettings?.customContent,
    singleSignOnEnabled: experienceSettings?.singleSignOnEnabled,
  };
};

export const usePasswordPolicy = () => {
  const { t } = useTranslation();
  const { experienceSettings } = useContext(PageContext);
  const policy = useMemo(
    () => passwordPolicyGuard.parse(experienceSettings?.passwordPolicy ?? {}),
    [experienceSettings]
  );
  const policyChecker = useMemo(() => new PasswordPolicyChecker(policy), [policy]);

  const requirementsDescription = useMemo(
    () =>
      policy.length.min <= 1 && policy.characterTypes.min <= 1
        ? undefined
        : t('description.password_requirements', {
            items: condArray(
              // There's no need to show the length requirement if it can be satisfied by the character types
              policy.length.min > policy.characterTypes.min &&
                t('description.password_requirement.length', { count: policy.length.min }),
              // Show the character types requirement if it's greater than 1.
              policy.characterTypes.min > 1 &&
                t('description.password_requirement.character_types', {
                  count: policy.characterTypes.min,
                })
            ),
          }),
    [t, policy.length.min, policy.characterTypes.min]
  );

  return {
    policy,
    policyChecker,
    /** The localized description of the password policy. */
    requirementsDescription,
  };
};

export const useForgotPasswordSettings = () => {
  const { experienceSettings } = useContext(PageContext);
  const { forgotPassword } = experienceSettings ?? {};

  const enabledMethodSet = new Set<VerificationCodeIdentifier>();

  if (forgotPassword?.email) {
    enabledMethodSet.add(SignInIdentifier.Email);
  }

  if (forgotPassword?.phone) {
    enabledMethodSet.add(SignInIdentifier.Phone);
  }

  return {
    isForgotPasswordEnabled: enabledMethodSet.size > 0,
    enabledMethodSet,
  };
};
