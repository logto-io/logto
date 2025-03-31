import { type PasswordPolicy } from '@logto/core-kit';
import {
  type SignUp,
  type SignInExperience,
  type SignInIdentifier,
  type SignUpIdentifier as SignUpIdentifierMethod,
} from '@logto/schemas';

export enum SignInExperienceTab {
  Branding = 'branding',
  SignUpAndSignIn = 'sign-up-and-sign-in',
  Content = 'content',
  PasswordPolicy = 'password-policy',
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
  'signUp' | 'customCss' | 'passwordPolicy'
> & {
  customCss?: string; // Code editor components can not properly handle null value, manually transform null to undefined instead.
  signUp: SignUpForm;
  /** The parsed password policy object. All properties are required. */
  passwordPolicy: PasswordPolicy & {
    /**
     * The custom words separated by line breaks.
     *
     * This property is only used for UI display.
     */
    customWords: string;
    /**
     * Whether the custom words feature is enabled. Default value will be true if `rejects.words` is not empty.
     *
     * This property is only used for UI display.
     */
    isCustomWordsEnabled: boolean;
  };
  createAccountEnabled: boolean;
};

export type SignInMethod = SignInExperience['signIn']['methods'][number];

export type SignInMethodsObject = Record<
  SignInIdentifier,
  { password: boolean; verificationCode: boolean }
>;

export type UpdateSignInExperienceData = Omit<SignInExperience, 'mfa'> & {
  /**
   * `mfa` data will not be updated in the sign-in experience page.
   * Hard code it to `undefined` to have a better type checking when constructing the update data.
   */
  mfa: undefined;
};
