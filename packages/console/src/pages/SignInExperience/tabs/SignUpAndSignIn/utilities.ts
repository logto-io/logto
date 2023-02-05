import { SignInIdentifier } from '@logto/schemas';

import type { SignUpForm } from '@/pages/SignInExperience/types';
import { SignUpIdentifier } from '@/pages/SignInExperience/types';

export const getSignInMethodPasswordCheckState = (
  signInIdentifier: SignInIdentifier,
  signUpConfig: SignUpForm,
  currentCheckState: boolean
) => {
  if (signInIdentifier === SignInIdentifier.Username) {
    return currentCheckState;
  }

  const { password: isSignUpPasswordRequired } = signUpConfig;

  return isSignUpPasswordRequired || currentCheckState;
};

export const getSignInMethodVerificationCodeCheckState = (
  signInIdentifier: SignInIdentifier,
  signUpConfig: SignUpForm,
  currentCheckState: boolean
) => {
  if (signInIdentifier === SignInIdentifier.Username) {
    return currentCheckState;
  }

  const { identifier: signUpIdentifier, password: isSignUpPasswordRequired } = signUpConfig;

  if (SignUpIdentifier.None !== signUpIdentifier && !isSignUpPasswordRequired) {
    return true;
  }

  return currentCheckState;
};

export const createSignInMethod = (identifier: SignInIdentifier) => ({
  identifier,
  password: true,
  verificationCode: identifier !== SignInIdentifier.Username,
  isPasswordPrimary: true,
});
