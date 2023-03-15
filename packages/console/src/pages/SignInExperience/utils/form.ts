import type { SignInExperience, SignUp } from '@logto/schemas';
import { SignInMode, SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { t } from 'i18next';
import type { DeepRequired, FieldErrorsImpl } from 'react-hook-form';

import {
  hasSignInMethodsChanged,
  hasSignUpSettingsChanged,
  hasSocialTargetsChanged,
} from '../components/SignUpAndSignInChangePreview/SignUpAndSignInDiffSection/utils';
import { signUpIdentifiersMapping } from '../constants';
import { SignUpIdentifier } from '../types';
import type { SignInExperienceForm, SignUpForm } from '../types';
import { mapIdentifiersToSignUpIdentifier } from './identifier';

export const signInExperienceParser = {
  toLocalSignUp: (signUp: SignUp): SignUpForm => {
    const { identifiers, ...signUpData } = signUp;

    return {
      identifier: mapIdentifiersToSignUpIdentifier(identifiers),
      ...signUpData,
    };
  },
  toRemoteSignUp: (signUpForm: SignUpForm): SignUp => {
    const { identifier, ...signUpFormData } = signUpForm;

    return {
      identifiers: signUpIdentifiersMapping[identifier],
      ...signUpFormData,
    };
  },
  toLocalForm: (signInExperience: SignInExperience): SignInExperienceForm => {
    const { signUp, signInMode, customCss } = signInExperience;

    return {
      ...signInExperience,
      signUp: signInExperienceParser.toLocalSignUp(signUp),
      createAccountEnabled: signInMode !== SignInMode.SignIn,
      // CodeEditor component can not properly handle i18n default value, put placeholder here as workaround
      customCss: customCss?.length
        ? customCss
        : t('admin_console.sign_in_exp.custom_css.css_code_editor_content_placeholder'),
    };
  },
  toRemoteModel: (setup: SignInExperienceForm): SignInExperience => {
    const { branding, createAccountEnabled, signUp, customCss } = setup;

    return {
      ...setup,
      branding: {
        ...branding,
        // Transform empty string to undefined
        favicon: conditional(branding.favicon?.length && branding.favicon),
        logoUrl: conditional(branding.logoUrl?.length && branding.logoUrl),
        darkLogoUrl: conditional(branding.darkLogoUrl?.length && branding.darkLogoUrl),
      },
      signUp: signUp
        ? signInExperienceParser.toRemoteSignUp(signUp)
        : {
            identifiers: [SignInIdentifier.Username],
            password: true,
            verify: false,
          },
      signInMode: createAccountEnabled ? SignInMode.SignInAndRegister : SignInMode.SignIn,
      customCss: customCss?.length ? customCss : null,
    };
  },
};

export const hasSignUpAndSignInConfigChanged = (
  before: SignInExperience,
  after: SignInExperience
): boolean => {
  return (
    !hasSignUpSettingsChanged(before.signUp, after.signUp) &&
    !hasSignInMethodsChanged(before.signIn.methods, after.signIn.methods) &&
    !hasSocialTargetsChanged(
      before.socialSignInConnectorTargets,
      after.socialSignInConnectorTargets
    )
  );
};

export const getBrandingErrorCount = (
  errors: FieldErrorsImpl<DeepRequired<SignInExperienceForm>>
) => {
  const { color, branding, customCss } = errors;
  const colorFormErrorCount = color ? Object.keys(color).length : 0;
  const brandingFormErrorCount = branding ? Object.keys(branding).length : 0;
  const customCssFormErrorCount = customCss ? 1 : 0;

  return colorFormErrorCount + brandingFormErrorCount + customCssFormErrorCount;
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
  const termsOfUseUrlErrorCount = errors.termsOfUseUrl ? 1 : 0;
  const privacyPolicyUrlErrorCount = errors.privacyPolicyUrl ? 1 : 0;

  return termsOfUseUrlErrorCount + privacyPolicyUrlErrorCount;
};
