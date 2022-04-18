import { SignInExperience, SignInMethods } from '@logto/schemas';

export type SignInExperienceForm = Omit<SignInExperience, 'signInMethods'> & {
  signInMethods: {
    primary?: keyof SignInMethods;
    enableSecondary: boolean;
    username: boolean;
    sms: boolean;
    email: boolean;
    social: boolean;
  };
};
