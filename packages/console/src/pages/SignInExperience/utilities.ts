import {
  SignInExperience,
  SignInMethodKey,
  SignInMethods,
  SignInMethodState,
} from '@logto/schemas';

import { LanguageMode, SignInExperienceForm } from './types';

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

    const {
      languageInfo: { autoDetect, fallbackLanguage, fixedLanguage },
    } = signInExperience;

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
      languageInfo: {
        mode: autoDetect ? LanguageMode.Auto : LanguageMode.Fixed,
        fallbackLanguage,
        fixedLanguage,
      },
    };
  },
  toRemoteModel: (setup: SignInExperienceForm): SignInExperience => {
    const {
      languageInfo: { mode, fallbackLanguage, fixedLanguage },
    } = setup;

    return {
      ...setup,
      signInMethods: {
        username: findMethodState(setup, 'username'),
        sms: findMethodState(setup, 'sms'),
        email: findMethodState(setup, 'email'),
        social: findMethodState(setup, 'social'),
      },
      languageInfo: {
        autoDetect: mode === LanguageMode.Auto,
        fallbackLanguage,
        fixedLanguage,
      },
    };
  },
};

export const compareSignInMethods = (
  before: SignInExperience,
  after: SignInExperience
): boolean => {
  if (before.socialSignInConnectorIds.length !== after.socialSignInConnectorIds.length) {
    return false;
  }

  if (before.socialSignInConnectorIds.some((id) => !after.socialSignInConnectorIds.includes(id))) {
    return false;
  }

  const { signInMethods: beforeMethods } = before;
  const { signInMethods: afterMethods } = after;

  return Object.values(SignInMethodKey).every((key) => beforeMethods[key] === afterMethods[key]);
};
