import type { SignInExperience, SignInIdentifier, SignUp } from '@logto/schemas';

export type SignInExperienceForm = Omit<SignInExperience, 'signUp'> & {
  signUp?: SignUp;
  createAccountEnabled: boolean;
};

export type SignInMethod = SignInExperience['signIn']['methods'][number];

export type SignInMethodsObject = Record<
  SignInIdentifier,
  { password: boolean; verificationCode: boolean }
>;
