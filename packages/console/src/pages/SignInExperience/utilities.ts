import {
  SignInExperience,
  SignInMethodKey,
  SignInMethods,
  SignInMethodState,
} from '@logto/schemas';

import { SignInExperienceForm } from './types';

const findMethodState = (
  setup: SignInExperienceForm,
  method: keyof SignInMethods
): SignInMethodState => {
  const { signInMethods } = setup;

  if (signInMethods.primary === method) {
    return SignInMethodState.Primary;
  }

  if (signInMethods[method]) {
    return SignInMethodState.Secondary;
  }

  return SignInMethodState.Disabled;
};

export const signInExperienceParser = {
  toLocalForm: (signInExperience: SignInExperience): SignInExperienceForm => {
    const methodKeys = Object.values(SignInMethodKey);
    const primaryMethod = methodKeys.find(
      (key) => signInExperience.signInMethods[key] === SignInMethodState.Primary
    );
    const secondaryMethods = methodKeys.filter(
      (key) => signInExperience.signInMethods[key] === SignInMethodState.Secondary
    );

    return {
      ...signInExperience,
      signInMethods: {
        primary: primaryMethod,
        enableSecondary: secondaryMethods.length > 0,
        username: secondaryMethods.includes(SignInMethodKey.Username),
        sms: secondaryMethods.includes(SignInMethodKey.SMS),
        email: secondaryMethods.includes(SignInMethodKey.Email),
        social: secondaryMethods.includes(SignInMethodKey.Social),
      },
    };
  },
  toRemoteModel: (setup: SignInExperienceForm): SignInExperience => {
    return {
      ...setup,
      signInMethods: {
        username: findMethodState(setup, 'username'),
        sms: findMethodState(setup, 'sms'),
        email: findMethodState(setup, 'email'),
        social: findMethodState(setup, 'social'),
      },
    };
  },
};
