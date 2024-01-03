import { type SignInExperience, type SignInIdentifier } from '@logto/schemas';

export enum Authentication {
  Password = 'password',
  VerificationCode = 'verificationCode',
}

export type OnboardingSieFormData = {
  logo?: string;
  color: string;
  identifier: SignInIdentifier;
  authentications: Authentication[];
  socialTargets?: string[];
};

export type UpdateOnboardingSieData = Pick<
  SignInExperience,
  'branding' | 'color' | 'signUp' | 'signIn' | 'socialSignInConnectorTargets'
>;
