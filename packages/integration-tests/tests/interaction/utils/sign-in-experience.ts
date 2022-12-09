import type { SignInExperience } from '@logto/schemas';
import { SignInMode, SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '@/api';

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
    identifier: SignInIdentifier.Sms,
    password: true,
    verificationCode: false,
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
  });
