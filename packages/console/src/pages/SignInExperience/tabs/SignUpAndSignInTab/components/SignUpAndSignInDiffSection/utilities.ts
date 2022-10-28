import type { SignUp } from '@logto/schemas';
import { assert, deduplicate } from '@silverhand/essentials';

import type { SignInMethod } from '../SignInMethodEditBox/types';
import type { Mutation, SignInMethodsDiff, SignUpDiff, SocialTargetsDiff } from './types';

/* eslint-disable @silverhand/fp/no-mutating-methods */
export const diffSignUp = (oldSignUp: SignUp, newSignUp: SignUp): SignUpDiff => {
  const { identifier: oldIdentifier, password: oldPassword, verify: oldVerify } = oldSignUp;
  const { identifier: newIdentifier, password: newPassword, verify: newVerify } = newSignUp;

  const signUpDiff: SignUpDiff = {
    identifier: [],
    password: [],
    verify: [],
  };

  if (oldIdentifier === newIdentifier) {
    signUpDiff.identifier.push({ mutation: 'none', value: oldIdentifier });
  } else {
    signUpDiff.identifier.push(
      { mutation: 'removed', value: oldIdentifier },
      { mutation: 'added', value: newIdentifier }
    );
  }

  if (oldPassword === newPassword) {
    signUpDiff.password.push({ mutation: 'none', value: oldPassword });
  } else {
    signUpDiff.password.push(
      { mutation: 'removed', value: oldPassword },
      { mutation: 'added', value: newPassword }
    );
  }

  if (oldVerify === newVerify) {
    signUpDiff.password.push({ mutation: 'none', value: oldVerify });
  } else {
    signUpDiff.password.push(
      { mutation: 'removed', value: oldVerify },
      { mutation: 'added', value: newVerify }
    );
  }

  return signUpDiff;
};
/* eslint-enable @silverhand/fp/no-mutating-methods */

const stringCompareFunction = (leftValue: string, rightValue: string) => {
  if (leftValue === rightValue) {
    return 0;
  }

  return leftValue > rightValue ? 1 : -1;
};

export const diffSignInMethods = (
  oldSignInMethods: SignInMethod[],
  newSignInMethods: SignInMethod[]
): SignInMethodsDiff => {
  const oldSignInIdentifiers = oldSignInMethods.map(({ identifier }) => identifier);
  const newSignInIdentifiers = newSignInMethods.map(({ identifier }) => identifier);
  const allIdentifiers = deduplicate([...oldSignInIdentifiers, ...newSignInIdentifiers]);

  const signInMethodsDiff = allIdentifiers.map<SignInMethodsDiff[number]>((identifier) => {
    if (oldSignInIdentifiers.includes(identifier) && !newSignInIdentifiers.includes(identifier)) {
      const oldSignInMethod = oldSignInMethods.find(
        ({ identifier: oldIdentifier }) => oldIdentifier === identifier
      );

      assert(oldSignInMethod, new Error('Unexpected: the old sign-in method is not found.'));

      return {
        mutation: 'removed',
        identifier,
        password: [{ mutation: 'none', value: oldSignInMethod.password }],
        verificationCode: [{ mutation: 'none', value: oldSignInMethod.verificationCode }],
      };
    }

    if (!oldSignInIdentifiers.includes(identifier) && newSignInIdentifiers.includes(identifier)) {
      const newSignInMethod = newSignInMethods.find(
        ({ identifier: newIdentifier }) => newIdentifier === identifier
      );

      assert(newSignInMethod, new Error('Unexpected: the new sign-in method is not found.'));

      return {
        mutation: 'added',
        identifier: newSignInMethod.identifier,
        password: [{ mutation: 'none', value: newSignInMethod.password }],
        verificationCode: [{ mutation: 'none', value: newSignInMethod.verificationCode }],
      };
    }

    const oldSignInMethod = oldSignInMethods.find(
      ({ identifier: oldIdentifier }) => oldIdentifier === identifier
    );

    assert(oldSignInMethod, new Error('Unexpected: the old sign-in method is not found.'));

    const newSignInMethod = newSignInMethods.find(
      ({ identifier: newIdentifier }) => newIdentifier === identifier
    );

    assert(newSignInMethod, new Error('Unexpected: the new sign-in method is not found.'));

    return {
      mutation: 'none',
      identifier: oldSignInMethod.identifier,
      password:
        oldSignInMethod.password === newSignInMethod.password
          ? [{ mutation: 'none', value: oldSignInMethod.password }]
          : [
              { mutation: 'removed', value: oldSignInMethod.password },
              { mutation: 'added', value: newSignInMethod.password },
            ],
      verificationCode:
        oldSignInMethod.verificationCode === newSignInMethod.verificationCode
          ? [{ mutation: 'none', value: oldSignInMethod.verificationCode }]
          : [
              { mutation: 'removed', value: oldSignInMethod.verificationCode },
              { mutation: 'added', value: newSignInMethod.verificationCode },
            ],
    };
  });

  return signInMethodsDiff
    .slice()
    .sort(({ identifier: leftIdentifier }, { identifier: rightIdentifier }) =>
      stringCompareFunction(leftIdentifier, rightIdentifier)
    );
};

export const diffSocialTargets = (
  oldSocialTargets: string[],
  newSocialTargets: string[]
): SocialTargetsDiff => {
  const allTargets = deduplicate([...oldSocialTargets, ...newSocialTargets]);

  const socialTargetsDiff = allTargets.map<SocialTargetsDiff[number]>((target) => {
    if (oldSocialTargets.includes(target) && !newSocialTargets.includes(target)) {
      return { mutation: 'removed', value: target };
    }

    if (!oldSocialTargets.includes(target) && newSocialTargets.includes(target)) {
      return { mutation: 'added', value: target };
    }

    return { mutation: 'none', value: target };
  });

  return socialTargetsDiff
    .slice()
    .sort(({ value: leftValue }, { value: rightValue }) =>
      stringCompareFunction(leftValue, rightValue)
    );
};

export const createDiffFilter = (isAfter: boolean) => (mutation: Mutation) =>
  isAfter ? mutation !== 'removed' : mutation !== 'added';

export const isSignUpDifferent = (signUpDiff: SignUpDiff) =>
  Object.entries(signUpDiff).some(([_, diffs]) =>
    diffs.some(({ mutation }) => mutation !== 'none')
  );

export const isSignInMethodsDifferent = (signInMethodsDiff: SignInMethodsDiff) =>
  signInMethodsDiff.some(
    ({ mutation, password: passwordDiffs, verificationCode: verificationCodeDiffs }) => {
      if (mutation !== 'none') {
        return true;
      }

      if (passwordDiffs.some(({ mutation }) => mutation !== 'none')) {
        return true;
      }

      return verificationCodeDiffs.some(({ mutation }) => mutation !== 'none');
    }
  );

export const isSocialTargetsDifferent = (socialTargetsDiff: SocialTargetsDiff) =>
  socialTargetsDiff.some(({ mutation }) => mutation !== 'none');
