import type { SignInIdentifier } from '@logto/schemas';

import type { SignInMethod } from './types';

export const mutateVerificationState = (
  value: SignInMethod[],
  identifier: SignInIdentifier,
  verification: 'password' | 'verificationCode',
  checked: boolean
) =>
  value.map((method) =>
    method.identifier === identifier
      ? {
          ...method,
          [verification]: checked,
        }
      : method
  );

export const appendSignInMethod = (
  appendTo: SignInMethod[],
  signInIdentifier: SignInIdentifier,
  requirePassword: boolean,
  requireVerificationCode: boolean
) => {
  if (appendTo.some((method) => method.identifier === signInIdentifier)) {
    return appendTo;
  }

  return [
    ...appendTo,
    {
      identifier: signInIdentifier,
      password: requirePassword,
      verificationCode: requireVerificationCode,
      isPasswordPrimary: true,
    },
  ];
};

export const togglePasswordPrimaryFlag = (value: SignInMethod[], identifier: SignInIdentifier) =>
  value.map((method) =>
    method.identifier === identifier
      ? {
          ...method,
          isPasswordPrimary: !method.isPasswordPrimary,
        }
      : method
  );
