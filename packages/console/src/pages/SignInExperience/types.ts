import type { SignInExperience, SignInMethodKey, SignUp } from '@logto/schemas';

export type SignInExperienceForm = Omit<SignInExperience, 'signInMethods' | 'signUp'> & {
  signInMethods: {
    primary?: SignInMethodKey;
    enableSecondary: boolean;
    username: boolean;
    sms: boolean;
    email: boolean;
    social: boolean;
  };
  signUp: Partial<SignUp>;
  createAccountEnabled: boolean;
};
