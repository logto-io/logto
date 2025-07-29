import { PasswordPolicyChecker, passwordPolicyGuard } from '@logto/core-kit';
import {
  AlternativeSignUpIdentifier,
  SignInIdentifier,
  SignInMode,
  type SignUpIdentifier,
  type VerificationCodeSignInIdentifier,
} from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { useContext, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
// eslint-disable-next-line unused-imports/no-unused-imports -- type only import
import type useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { type SignInExperienceResponse, type VerificationCodeIdentifier } from '@/types';

type UseSieMethodsReturnType = {
  /**
   * Primary sign-up identifiers, used to render the first screen form of the registration flow.
   *
   * @remarks
   * Currently secondary identifiers are not used when rendering the first screen form.
   * Additional identifiers must be applied in the following user profile fulfillment step.
   * @see {useRequiredProfileErrorHandler} for more information.
   */
  signUpMethods: SignInIdentifier[];
  secondaryIdentifiers: SignUpIdentifier[];
  passwordRequiredForSignUp: boolean;
  signInMethods: SignInExperienceResponse['signIn']['methods'];
  socialSignInSettings: SignInExperienceResponse['socialSignIn'];
  socialConnectors: SignInExperienceResponse['socialConnectors'];
  ssoConnectors: SignInExperienceResponse['ssoConnectors'];
  signInMode: SignInExperienceResponse['signInMode'] | undefined;
  forgotPassword: SignInExperienceResponse['forgotPassword'] | undefined;
  customContent: SignInExperienceResponse['customContent'] | undefined;
  singleSignOnEnabled: boolean | undefined;
  /**
   * Check if the given verification code identifier is enabled for sign-up.
   * Used in the verification code sign-in flow, if the verified email/phone number has not been registered,
   * and the identifier type is enabled for sign-up, allow the user to sign-up with the identifier directly.
   */
  isVerificationCodeEnabledForSignUp: (type: VerificationCodeSignInIdentifier) => boolean;
  /**
   * Check if the given verification code identifier is enabled for sign-in.
   * Used in the verification code sign-up flow, if the verified email/phone number has been registered,
   * and the identifier type is enabled for sign-in, allow the user to sign-in with the identifier directly.
   */
  isVerificationCodeEnabledForSignIn: (type: VerificationCodeSignInIdentifier) => boolean;
};

export const useSieMethods = (): UseSieMethodsReturnType => {
  const { experienceSettings } = useContext(PageContext);

  const signUpMethods = useMemo(
    () => experienceSettings?.signUp.identifiers ?? [],
    [experienceSettings]
  );

  const secondaryIdentifiers = useMemo(() => {
    return (
      experienceSettings?.signUp.secondaryIdentifiers?.map(({ identifier }) => identifier) ?? []
    );
  }, [experienceSettings]);

  const isVerificationCodeEnabledForSignUp = useCallback(
    (type: VerificationCodeSignInIdentifier) => {
      if (experienceSettings?.signInMode === SignInMode.SignIn) {
        return false;
      }

      return (
        signUpMethods.includes(type) ||
        secondaryIdentifiers.includes(type) ||
        secondaryIdentifiers.includes(AlternativeSignUpIdentifier.EmailOrPhone)
      );
    },
    [secondaryIdentifiers, signUpMethods, experienceSettings]
  );

  const signInMethods = useMemo(
    () =>
      experienceSettings?.signIn.methods.filter(
        // Filter out empty settings
        ({ password, verificationCode }) => password || verificationCode
      ) ?? [],
    [experienceSettings]
  );

  const isVerificationCodeEnabledForSignIn = useCallback(
    (type: VerificationCodeSignInIdentifier) => {
      if (experienceSettings?.signInMode === SignInMode.Register) {
        return false;
      }

      return Boolean(signInMethods.find(({ identifier }) => identifier === type)?.verificationCode);
    },
    [experienceSettings?.signInMode, signInMethods]
  );

  const passwordRequiredForSignUp = useMemo(() => {
    const { signUp } = experienceSettings ?? {};
    return signUp?.password ?? false;
  }, [experienceSettings]);

  return useMemo(
    () => ({
      signUpMethods,
      signInMethods,
      secondaryIdentifiers,
      socialSignInSettings: experienceSettings?.socialSignIn ?? {},
      socialConnectors: experienceSettings?.socialConnectors ?? [],
      ssoConnectors: experienceSettings?.ssoConnectors ?? [],
      signInMode: experienceSettings?.signInMode,
      forgotPassword: experienceSettings?.forgotPassword,
      customContent: experienceSettings?.customContent,
      singleSignOnEnabled: experienceSettings?.singleSignOnEnabled,
      passwordRequiredForSignUp,
      isVerificationCodeEnabledForSignUp,
      isVerificationCodeEnabledForSignIn,
    }),
    [
      signUpMethods,
      signInMethods,
      secondaryIdentifiers,
      experienceSettings?.socialSignIn,
      experienceSettings?.socialConnectors,
      experienceSettings?.ssoConnectors,
      experienceSettings?.signInMode,
      experienceSettings?.forgotPassword,
      experienceSettings?.customContent,
      experienceSettings?.singleSignOnEnabled,
      passwordRequiredForSignUp,
      isVerificationCodeEnabledForSignUp,
      isVerificationCodeEnabledForSignIn,
    ]
  );
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
