import en from '@logto/phrases-ui/lib/locales/en';
import type { SignInExperience, Translation } from '@logto/schemas';
import { SignUpIdentifier, SignInMode } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { DeepRequired, FieldErrorsImpl } from 'react-hook-form';

import {
  isSignInMethodsDifferent,
  isSignUpDifferent,
  isSocialTargetsDifferent,
} from './components/SignUpAndSignInChangePreview/SignUpAndSignInDiffSection/utilities';
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

export const getBrandingErrorCount = (
  errors: FieldErrorsImpl<DeepRequired<SignInExperienceForm>>
) => {
  const { color, branding } = errors;
  const colorFormErrorCount = color ? Object.keys(color).length : 0;
  const brandingFormErrorCount = branding ? Object.keys(branding).length : 0;

  return colorFormErrorCount + brandingFormErrorCount;
};

export const getSignUpAndSignInErrorCount = (
  errors: FieldErrorsImpl<DeepRequired<SignInExperienceForm>>,
  formData: SignInExperienceForm
) => {
  const signUpIdentifier = formData.signUp?.identifier;
  /**
   * Note: we treat the `emailOrSms` sign-up identifier as 2 errors when it's invalid.
   */
  const signUpIdentifierRelatedErrorCount = signUpIdentifier
    ? signUpIdentifier === SignUpIdentifier.EmailOrSms
      ? 2
      : 1
    : 0;

  const { signUp, signIn } = errors;

  const signUpErrorCount = signUp?.identifier ? signUpIdentifierRelatedErrorCount : 0;

  const signInMethodErrors = signIn?.methods;

  const signInMethodErrorCount = Array.isArray(signInMethodErrors)
    ? signInMethodErrors.filter(Boolean).length
    : 0;

  return signUpErrorCount + signInMethodErrorCount;
};

export const getOthersErrorCount = (
  errors: FieldErrorsImpl<DeepRequired<SignInExperienceForm>>
) => {
  const { termsOfUse } = errors;

  const termsOfUseErrorCount = termsOfUse ? Object.keys(termsOfUse).length : 0;

  return termsOfUseErrorCount;
};
