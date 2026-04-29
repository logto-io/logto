import {
  AccountCenterControlValue,
  type AccountCenter as AccountCenterConfig,
  type SignUp,
  type SignInExperience,
  type SignInIdentifier,
  type SignUpIdentifier as SignUpIdentifierMethod,
  type SignUpProfileFields,
  type AccountCenterFieldControl,
} from '@logto/schemas';
/**
 * Omit the `mfa`, `adaptiveMfa`, `captchaPolicy`, `passwordPolicy`, `sentinelPolicy` and `emailBlocklistPolicy` fields from the sign-in experience.
 * Since those fields are not managed by the sign-in experience page.
 */
type OmittedSignInExperienceKeys = keyof Pick<
  SignInExperience,
  | 'mfa'
  | 'adaptiveMfa'
  | 'captchaPolicy'
  | 'sentinelPolicy'
  | 'passwordPolicy'
  | 'emailBlocklistPolicy'
>;

export enum SignInExperienceTab {
  Branding = 'branding',
  SignUpAndSignIn = 'sign-up-and-sign-in',
  CollectUserProfile = 'collect-user-profile',
  AccountCenter = 'account-center',
  Content = 'content',
}

const accountCenterFieldKeys: Array<keyof AccountCenterFieldControl> = [
  'email',
  'phone',
  'social',
  'password',
  'mfa',
  'username',
  'name',
  'avatar',
  'profile',
  'customData',
  'session',
] as const;

export type AccountCenterFieldKey = (typeof accountCenterFieldKeys)[number];

export type AccountCenterFormValues = {
  enabled: boolean;
  fields: Record<AccountCenterFieldKey, AccountCenterControlValue>;
  webauthnRelatedOrigins: string[];
  deleteAccountUrl: string;
  customCss?: string;
};

const createDefaultAccountCenterFormValues = (): AccountCenterFormValues => ({
  enabled: false,
  // eslint-disable-next-line no-restricted-syntax
  fields: Object.fromEntries(
    accountCenterFieldKeys.map((key) => [key, AccountCenterControlValue.Off])
  ) as Record<AccountCenterFieldKey, AccountCenterControlValue>,
  webauthnRelatedOrigins: [],
  deleteAccountUrl: '',
});

export const normalizeWebauthnRelatedOrigins = (origins?: string[]): string[] =>
  origins?.map((origin) => origin.trim()).filter(Boolean) ?? [];

export const normalizeDeleteAccountUrl = (url?: string): string => url?.trim() ?? '';

export const convertAccountCenterToForm = (
  accountCenter?: AccountCenterConfig
): AccountCenterFormValues => ({
  enabled: accountCenter?.enabled ?? false,
  fields: {
    ...createDefaultAccountCenterFormValues().fields,
    ...accountCenter?.fields,
  },
  webauthnRelatedOrigins: normalizeWebauthnRelatedOrigins(accountCenter?.webauthnRelatedOrigins),
  deleteAccountUrl: normalizeDeleteAccountUrl(accountCenter?.deleteAccountUrl ?? undefined),
  customCss: accountCenter?.customCss ?? undefined,
});

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
  'signUp' | 'customCss' | 'signUpProfileFields' | OmittedSignInExperienceKeys
> & {
  customCss?: string; // Code editor components can not properly handle null value, manually transform null to undefined instead.
  signUp: SignUpForm;
  /**
   * `useFieldArray` requires an array, so the form always stores this as an array.
   */
  signUpProfileFields: SignUpProfileFields;
  /**
   * Legacy tenants may still store `null`, which means "use the default catalog behavior".
   * Keep tracking whether the original value was already explicitly configured so saving unrelated
   * settings does not silently change `null` into `[]`.
   */
  hasConfiguredSignUpProfileFields: boolean;
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
export type SignInExperiencePageManagedData = Omit<
  SignInExperience,
  OmittedSignInExperienceKeys | 'hideLogtoBranding'
> & {
  hideLogtoBranding?: boolean;
};
