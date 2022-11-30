import type { SignInExperience } from '@logto/schemas';
import { diff } from 'deep-object-diff';

import type { SignInMethod, SignInMethodsObject } from '@/pages/SignInExperience/types';

export const isSignUpDifferent = (
  before: SignInExperience['signUp'],
  after: SignInExperience['signUp']
) => Object.keys(diff(before, after)).length > 0;

export const convertToSignInMethodsObject = (signInMethods: SignInMethod[]): SignInMethodsObject =>
  signInMethods.reduce<SignInMethodsObject>(
    (methodsObject, { identifier, password, verificationCode }) => ({
      ...methodsObject,
      [identifier]: { password, verificationCode },
    }),
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, no-restricted-syntax
    {} as SignInMethodsObject
  );

export const isSignInMethodsDifferent = (before: SignInMethod[], after: SignInMethod[]) =>
  Object.keys(diff(convertToSignInMethodsObject(before), convertToSignInMethodsObject(after)))
    .length > 0;

export const isSocialTargetsDifferent = (before: string[], after: string[]) =>
  Object.keys(diff(before.slice().sort(), after.slice().sort())).length > 0;
