import { SignInIdentifier } from '@logto/schemas';

import type { SignUpForm } from '@/pages/SignInExperience/types';
import { SignUpIdentifier } from '@/pages/SignInExperience/types';

export const getSignInMethodPasswordCheckState = (
  signInIdentifier: SignInIdentifier,
  isSignUpPasswordRequired: boolean,
  defaultCheckState = true
) => {
  if (signInIdentifier === SignInIdentifier.Username) {
    return true;
  }

  return isSignUpPasswordRequired || defaultCheckState;
};

export const getSignInMethodVerificationCodeCheckState = (
  signInIdentifier: SignInIdentifier,
  signUpConfig: SignUpForm,
  currentCheckState?: boolean
) => {
  if (signInIdentifier === SignInIdentifier.Username) {
    return false;
  }

  const {
    identifier: signUpIdentifier,
    password: isSignUpPasswordRequired,
    verify: isSignUpVerificationCodeRequired,
  } = signUpConfig;

  const keepCurrentState =
    [SignUpIdentifier.Username, SignUpIdentifier.None].includes(signUpIdentifier) ||
    (isSignUpPasswordRequired && isSignUpVerificationCodeRequired);

  if (keepCurrentState) {
    return currentCheckState ?? isSignUpVerificationCodeRequired;
  }

  return isSignUpVerificationCodeRequired;
};
