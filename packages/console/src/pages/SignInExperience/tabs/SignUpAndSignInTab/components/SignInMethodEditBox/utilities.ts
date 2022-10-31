import { SignInIdentifier } from '@logto/schemas';

import type { SignInMethod } from './types';

export const computeOnVerificationStateChanged = (
  oldValue: SignInMethod[],
  identifier: SignInIdentifier,
  verification: 'password' | 'verificationCode',
  checked: boolean
) =>
  oldValue.map((method) =>
    method.identifier === identifier
      ? {
          ...method,
          [verification]: checked,
        }
      : method
  );

export const computeOnSignInMethodAppended = (
  appendTo: SignInMethod[],
  appended: SignInMethod
): SignInMethod[] => {
  const { identifier: signInIdentifier } = appended;

  if (appendTo.some((method) => method.identifier === signInIdentifier)) {
    return appendTo;
  }

  return [...appendTo, appended];
};

export const computeOnPasswordPrimaryFlagToggled = (
  oldValue: SignInMethod[],
  identifier: SignInIdentifier
) =>
  oldValue.map((method) =>
    method.identifier === identifier
      ? {
          ...method,
          isPasswordPrimary: !method.isPasswordPrimary,
        }
      : method
  );

export const getSignInMethodAuthValue = (
  signInIdentifier: SignInIdentifier,
  isSignUpAuthRequired: boolean,
  originValue?: boolean
) => {
  if (signInIdentifier === SignInIdentifier.Username) {
    return true;
  }

  return isSignUpAuthRequired || (originValue ?? isSignUpAuthRequired);
};
