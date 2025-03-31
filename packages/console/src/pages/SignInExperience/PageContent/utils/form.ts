import type { SignInExperience, SignUp } from '@logto/schemas';
import { diff } from 'deep-object-diff';
import type { DeepRequired, FieldErrorsImpl } from 'react-hook-form';

import type { SignInExperienceForm, SignInMethod, SignInMethodsObject } from '../../types';

export const convertToSignInMethodsObject = (signInMethods: SignInMethod[]): SignInMethodsObject =>
  signInMethods.reduce<SignInMethodsObject>(
    (methodsObject, { identifier, password, verificationCode }) => ({
      ...methodsObject,
      [identifier]: { password, verificationCode },
    }),
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, no-restricted-syntax
    {} as SignInMethodsObject
  );

const hasSignUpSettingsChanged = (before: SignUp, after: SignUp) =>
  Object.keys(diff(before, after)).length > 0;

const hasSignInMethodsChanged = (before: SignInMethod[], after: SignInMethod[]) =>
  Object.keys(diff(convertToSignInMethodsObject(before), convertToSignInMethodsObject(after)))
    .length > 0;

const hasSocialTargetsChanged = (before: string[], after: string[]) =>
  Object.keys(diff(before.slice().sort(), after.slice().sort())).length > 0;

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
  const { signUp, signIn } = errors;

  const signUpIdentifiersError = signUp?.identifiers;
  const signUpErrorCount = Array.isArray(signUpIdentifiersError)
    ? signUpIdentifiersError.filter(Boolean).length
    : 0;

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
