import en from '@logto/phrases-ui/lib/locales/en';
import type { SignInExperience, Translation } from '@logto/schemas';
import { SignUpIdentifier, SignInMode } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import {
  isSignInMethodsDifferent,
  isSignUpDifferent,
  isSocialTargetsDifferent,
} from './tabs/SignUpAndSignInTab/components/SignUpAndSignInDiffSection/utilities';
import type { SignInExperienceForm } from './types';

export const signInExperienceParser = {
  toLocalForm: (signInExperience: SignInExperience): SignInExperienceForm => {
    const { signInMode } = signInExperience;

    return {
      ...signInExperience,
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
      signUp: signUp ?? {
        identifier: SignUpIdentifier.Username,
        password: true,
        verify: false,
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
