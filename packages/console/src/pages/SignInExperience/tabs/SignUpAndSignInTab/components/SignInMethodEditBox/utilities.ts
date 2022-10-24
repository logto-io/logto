import type { SignInIdentifier } from '@logto/schemas';

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
  oldValue: SignInMethod[],
  signInIdentifier: SignInIdentifier,
  requirePassword: boolean,
  requireVerificationCode: boolean
) => {
  if (oldValue.some((method) => method.identifier === signInIdentifier)) {
    return oldValue;
  }

  return [
    ...oldValue,
    {
      identifier: signInIdentifier,
      password: requirePassword,
      verificationCode: requireVerificationCode,
      isPasswordPrimary: true,
    },
  ];
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
