import type { SignInExperience, SignUp } from '@logto/schemas';

export type SignInExperienceForm = Omit<SignInExperience, 'signInMethods' | 'signUp'> & {
  signUp: Partial<SignUp>;
  createAccountEnabled: boolean;
};
