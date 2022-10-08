import { SignInExperience, SignInMethodKey } from '@logto/schemas';

export type SignInExperienceForm = Omit<SignInExperience, 'signInMethods'> & {
  signInMethods: {
    primary?: SignInMethodKey;
    enableSecondary: boolean;
    username: boolean;
    sms: boolean;
    email: boolean;
    social: boolean;
  };
  createAccountEnabled: boolean;
};
