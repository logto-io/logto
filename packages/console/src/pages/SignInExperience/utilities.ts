import en from '@logto/phrases-ui/lib/locales/en';
import type { SignInExperience, SignInMethods, Translation } from '@logto/schemas';
import { SignUpIdentifier, SignInMethodKey, SignInMethodState, SignInMode } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import {
  isSignInMethodsDifferent,
  isSignUpDifferent,
  isSocialTargetsDifferent,
} from './tabs/SignUpAndSignInTab/components/SignUpAndSignInDiffSection/utilities';
import type { SignInExperienceForm } from './types';

const findMethodState = (
  setup: SignInExperienceForm,
  method: keyof SignInMethods
): SignInMethodState => {
  const { signInMethods } = setup;

  if (signInMethods.primary === method) {
    return SignInMethodState.Primary;
  }

  if (!signInMethods.enableSecondary) {
    return SignInMethodState.Disabled;
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

    const { signInMode } = signInExperience;

    return {
      ...signInExperience,
      signInMethods: {
        primary: primaryMethod,
        enableSecondary: secondaryMethods.length > 0,
        username: secondaryMethods.includes(SignInMethodKey.Username),
        sms: secondaryMethods.includes(SignInMethodKey.Sms),
        email: secondaryMethods.includes(SignInMethodKey.Email),
        social: secondaryMethods.includes(SignInMethodKey.Social),
      },
      createAccountEnabled: signInMode !== SignInMode.SignIn,
    };
  },
  toRemoteModel: (setup: SignInExperienceForm): SignInExperience => {
    const { branding, createAccountEnabled, signUp } = setup;

    return {
      ...setup,
      branding: {
        ...branding,
        // Transform empty string to undefined
        darkLogoUrl: conditional(branding.darkLogoUrl?.length && branding.darkLogoUrl),
        slogan: conditional(branding.slogan?.length && branding.slogan),
      },
      signInMethods: {
        username: findMethodState(setup, 'username'),
        sms: findMethodState(setup, 'sms'),
        email: findMethodState(setup, 'email'),
        social: findMethodState(setup, 'social'),
      },
      signUp: {
        identifier: signUp.identifier ?? SignUpIdentifier.Username,
        password: Boolean(signUp.password),
        verify: Boolean(signUp.verify),
      },
      signInMode: createAccountEnabled ? SignInMode.SignInAndRegister : SignInMode.SignIn,
    };
  },
};

export const compareSignUpAndSignInConfigs = (
  before: SignInExperience,
  after: SignInExperience
): boolean => {
  return (
    !isSignUpDifferent(before.signUp, after.signUp) &&
    !isSignInMethodsDifferent(before.signIn.methods, after.signIn.methods) &&
    !isSocialTargetsDifferent(
      before.socialSignInConnectorTargets,
      after.socialSignInConnectorTargets
    )
  );
};

export const flattenTranslation = (
  translation: Translation,
  keyPrefix = ''
): Record<string, string> =>
  Object.keys(translation).reduce((result, key) => {
    const prefix = keyPrefix ? `${keyPrefix}.` : keyPrefix;
    const unwrappedKey = `${prefix}${key}`;
    const unwrapped = translation[key];

    return unwrapped === undefined
      ? result
      : {
          ...result,
          ...(typeof unwrapped === 'string'
            ? { [unwrappedKey]: unwrapped }
            : flattenTranslation(unwrapped, unwrappedKey)),
        };
  }, {});

const emptyTranslation = (translation: Translation): Translation =>
  Object.entries(translation).reduce((result, [key, value]) => {
    return typeof value === 'string'
      ? { ...result, [key]: '' }
      : {
          ...result,
          [key]: emptyTranslation(value),
        };
  }, {});

export const createEmptyUiTranslation = () => emptyTranslation(en.translation);
