import { PasswordPolicyChecker, passwordPolicyGuard } from '@logto/core-kit';
import { SignInIdentifier } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { type VerificationCodeIdentifier } from '@/types';

export const useSieMethods = () => {
  const { experienceSettings } = useContext(PageContext);
  const { identifiers, password, verify } = experienceSettings?.signUp ?? {};

  return {
    signUpMethods: identifiers ?? [],
    signUpSettings: { password, verify },
    signInMethods:
      experienceSettings?.signIn.methods.filter(
        // Filter out empty settings
        ({ password, verificationCode }) => password || verificationCode
      ) ?? [],
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    signInMode: experienceSettings?.signInMode,
    forgotPassword: experienceSettings?.forgotPassword,
  };
};

export const useSignInExperience = () => {
  const { experienceSettings } = useContext(PageContext);

  return experienceSettings;
};

export const usePasswordPolicy = () => {
  const { t } = useTranslation();
  const { experienceSettings } = useContext(PageContext);
  const policy = useMemo(
    () => passwordPolicyGuard.parse(experienceSettings?.passwordPolicy ?? {}),
    [experienceSettings]
  );
  const policyChecker = useMemo(() => new PasswordPolicyChecker(policy), [policy]);

  return {
    policy,
    policyChecker,
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
