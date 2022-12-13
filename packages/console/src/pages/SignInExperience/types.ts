import type { SignInExperience, SignInIdentifier, SignUp } from '@logto/schemas';

export enum SignUpIdentifier {
  Email = 'email',
  Sms = 'sms',
  Username = 'username',
  EmailOrSms = 'emailOrSms',
  None = 'none',
}

export type SignUpForm = Omit<SignUp, 'identifiers'> & {
  identifier: SignUpIdentifier;
};

export type SignInExperienceForm = Omit<SignInExperience, 'signUp'> & {
  signUp?: SignUpForm;
  createAccountEnabled: boolean;
};

export type SignInMethod = SignInExperience['signIn']['methods'][number];

export type SignInMethodsObject = Record<
  SignInIdentifier,
  { password: boolean; verificationCode: boolean }
>;
