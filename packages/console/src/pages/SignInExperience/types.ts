import {
  type SignUp,
  type SignInExperience,
  type SignInIdentifier,
  type SignUpIdentifier as SignUpIdentifierMethod,
} from '@logto/schemas';

/**
 * Omit the `mfa`, `captchaPolicy`, 'passwordPolicy', `sentinelPolicy` and `emailBlocklistPolicy` fields from the sign-in experience.
 * Since those fields are not managed by the sign-in experience page.
 */
type OmittedSignInExperienceKeys = keyof Pick<
  SignInExperience,
  'mfa' | 'captchaPolicy' | 'sentinelPolicy' | 'passwordPolicy' | 'emailBlocklistPolicy'
>;

export enum SignInExperienceTab {
  Branding = 'branding',
  SignUpAndSignIn = 'sign-up-and-sign-in',
  CollectUserProfile = 'collect-user-profile',
  Content = 'content',
}

/**
 * @deprecated
 */
export enum SignUpIdentifier {
  Email = 'email',
  Phone = 'phone',
  Username = 'username',
  EmailOrSms = 'emailOrSms',
  None = 'none',
}

export type SignUpForm = Omit<SignUp, 'identifiers' | 'secondaryIdentifiers'> & {
  /**
   * New identifiers field that merges the `signUpIdentifier` and `secondaryIdentifiers` fields
   **/
  identifiers: Array<{
    /**
     * Wrapped the identifier value into an object to make it manageable using the `useFieldArray` hook.
     * `useFieldArray` requires the array item to be an object.
     * Also for the future benefit, we may add `verify` field to the identifier object, once we support
     * unverified email/phone as the sign-up identifier.
     */
    identifier: SignUpIdentifierMethod;
  }>;
};

export type SignInExperienceForm = Omit<
  SignInExperience,
  'signUp' | 'customCss' | OmittedSignInExperienceKeys
> & {
  customCss?: string; // Code editor components can not properly handle null value, manually transform null to undefined instead.
  signUp: SignUpForm;
  createAccountEnabled: boolean;
};

export type SignInMethod = SignInExperience['signIn']['methods'][number];

export type SignInMethodsObject = Record<
  SignInIdentifier,
  { password: boolean; verificationCode: boolean }
>;

/**
 * The managed data of the sign-in experience page.
 * This type omits the properties defined in @see {OmittedSignInExperienceKeys},
 * as they are not managed by the sign-in experience page.
 *
 * - Those keys should be omitted from the form data.
 * - Those keys should be omitted from the submitted data.
 * - Those keys should not be used in any data comparison logic.
 */
export type SignInExperiencePageManagedData = Omit<SignInExperience, OmittedSignInExperienceKeys>;
