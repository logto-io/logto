import { SignInIdentifier } from '@logto/schemas';

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

export const getSignInMethodVerificationCodeCheckState = (signInIdentifier: SignInIdentifier) => {
  return signInIdentifier !== SignInIdentifier.Username;
};
