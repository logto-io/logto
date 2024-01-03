import type { SignInExperience } from '@logto/schemas';
import type { DeepRequired, FieldErrorsImpl } from 'react-hook-form';

import {
  hasSignInMethodsChanged,
  hasSignUpSettingsChanged,
  hasSocialTargetsChanged,
} from '../components/SignUpAndSignInChangePreview/SignUpAndSignInDiffSection/utils';
import { SignUpIdentifier } from '../types';
import type { SignInExperienceForm } from '../types';

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

export const getContentErrorCount = (
  errors: FieldErrorsImpl<DeepRequired<SignInExperienceForm>>
) => {
  const termsOfUseUrlErrorCount = errors.termsOfUseUrl ? 1 : 0;
  const privacyPolicyUrlErrorCount = errors.privacyPolicyUrl ? 1 : 0;

  return termsOfUseUrlErrorCount + privacyPolicyUrlErrorCount;
};
