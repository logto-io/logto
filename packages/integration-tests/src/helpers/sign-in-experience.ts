import type { SignInExperience } from '@logto/schemas';
import { SignInMode, SignInIdentifier, MfaFactor, MfaPolicy } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/index.js';

const defaultSignUpMethod = {
  identifiers: [],
  password: false,
  verify: false,
};

const defaultPasswordSignInMethods = [
  {
    identifier: SignInIdentifier.Username,
    password: true,
    verificationCode: false,
    isPasswordPrimary: false,
  },
  {
    identifier: SignInIdentifier.Email,
    password: true,
    verificationCode: false,
    isPasswordPrimary: false,
  },
  {
    identifier: SignInIdentifier.Phone,
    password: true,
    verificationCode: false,
    isPasswordPrimary: false,
  },
];

const defaultVerificationCodeSignInMethods = [
  {
    identifier: SignInIdentifier.Username,
    password: true,
    verificationCode: false,
    isPasswordPrimary: true,
  },
  {
    identifier: SignInIdentifier.Email,
    password: true,
    verificationCode: true,
    isPasswordPrimary: false,
  },
  {
    identifier: SignInIdentifier.Phone,
    password: true,
    verificationCode: true,
    isPasswordPrimary: false,
  },
];

export const enableAllPasswordSignInMethods = async (
  signUp: SignInExperience['signUp'] = defaultSignUpMethod
) =>
  updateSignInExperience({
    signInMode: SignInMode.SignInAndRegister,
    signUp,
    signIn: {
      methods: defaultPasswordSignInMethods,
    },
    mfa: { factors: [], policy: MfaPolicy.UserControlled },
  });

export const enableAllVerificationCodeSignInMethods = async (
  signUp: SignInExperience['signUp'] = defaultSignUpMethod
) =>
  updateSignInExperience({
    signInMode: SignInMode.SignInAndRegister,
    signUp,
    signIn: {
      methods: defaultVerificationCodeSignInMethods,
    },
    mfa: { factors: [], policy: MfaPolicy.UserControlled },
  });

export const enableMandatoryMfaWithTotp = async () =>
  updateSignInExperience({
    mfa: {
      factors: [MfaFactor.TOTP],
      policy: MfaPolicy.Mandatory,
    },
  });
