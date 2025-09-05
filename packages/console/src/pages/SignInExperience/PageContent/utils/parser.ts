import {
  AlternativeSignUpIdentifier,
  SignInIdentifier,
  SignInMode,
  type SignInExperience,
  type SignUp,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { emptyBranding } from '@/types/sign-in-experience';
import { removeFalsyValues } from '@/utils/object';

import {
  type SignInExperiencePageManagedData,
  type SignInExperienceForm,
  type SignUpForm,
} from '../../types';

/**
 * For backward compatibility,
 * we need to safely parse the {@link SignUp.identifiers} to the {@link SignUpForm.identifiers} format.
 */
const parsePrimaryIdentifier = (identifiers: SignInIdentifier[]): SignUpForm['identifiers'] => {
  if (identifiers.length === 0) {
    return [];
  }

  if (identifiers.length === 1 && identifiers[0]) {
    return [
      {
        identifier: identifiers[0],
      },
    ];
  }

  if (
    identifiers.length === 2 &&
    identifiers.includes(SignInIdentifier.Email) &&
    identifiers.includes(SignInIdentifier.Phone)
  ) {
    return [
      {
        identifier: AlternativeSignUpIdentifier.EmailOrPhone,
      },
    ];
  }

  throw new Error('Invalid identifiers in the sign up settings.');
};

const signUpIdentifiersParser = {
  /**
   * Merge the @see {SignUp['identifiers']} with the @see {SignUp['secondaryIdentifiers']}
   * into one @see {SignUpForm['identifiers']} form field.
   */
  toSignUpForm: (
    identifiers: SignInIdentifier[],
    secondaryIdentifiers: SignUp['secondaryIdentifiers'] = []
  ): SignUpForm['identifiers'] => {
    const primarySignUpIdentifier = parsePrimaryIdentifier(identifiers);
    return [
      ...primarySignUpIdentifier,
      ...secondaryIdentifiers.map(({ identifier }) => ({ identifier })),
    ];
  },
  /**
   * For backward compatibility,
   * we need to split the @see {SignUpForm['identifiers']} into @see {SignUp['identifiers']}
   * and @see {SignUp['secondaryIdentifiers']} two fields.
   */
  toSieData: (
    signUpIdentifiers: SignUpForm['identifiers']
  ): Pick<SignUp, 'identifiers' | 'secondaryIdentifiers'> => {
    const primaryIdentifier = signUpIdentifiers[0];

    const identifiers = primaryIdentifier
      ? primaryIdentifier.identifier === AlternativeSignUpIdentifier.EmailOrPhone
        ? [SignInIdentifier.Email, SignInIdentifier.Phone]
        : [primaryIdentifier.identifier]
      : [];

    const secondaryIdentifiers = signUpIdentifiers.slice(1).map(({ identifier }) => ({
      identifier,
      // For email or phone, we always set the `verify` flag to true.
      ...conditional(identifier !== SignInIdentifier.Username && { verify: true }),
    }));

    return {
      identifiers,
      secondaryIdentifiers,
    };
  },
};

export const signUpFormDataParser = {
  fromSignUp: (data: SignUp): SignUpForm => {
    const { identifiers, secondaryIdentifiers, ...signUpData } = data;

    return {
      identifiers: signUpIdentifiersParser.toSignUpForm(identifiers, secondaryIdentifiers),
      ...signUpData,
    };
  },
  toSignUp: (formData: SignUpForm): SignUp => {
    const { identifiers, ...signUpFormData } = formData;

    return {
      ...signUpIdentifiersParser.toSieData(identifiers),
      ...signUpFormData,
    };
  },
};

export const sieFormDataParser = {
  fromSignInExperience: (data: SignInExperience): SignInExperienceForm => {
    const {
      signUp,
      customCss,
      branding,
      // Start: Remove the omitted fields from the data
      passwordPolicy,
      mfa,
      captchaPolicy,
      sentinelPolicy,
      emailBlocklistPolicy,
      // End: Remove the omitted fields from the data
      ...rest
    } = data;

    return {
      ...rest,
      signUp: signUpFormDataParser.fromSignUp(signUp),
      createAccountEnabled: rest.signInMode !== SignInMode.SignIn,
      customCss: customCss ?? undefined,
      branding: {
        ...emptyBranding,
        ...branding,
      },
    };
  },
  toSignInExperience: (formData: SignInExperienceForm): SignInExperiencePageManagedData => {
    const { branding, createAccountEnabled, signUp, customCss, forgotPasswordMethods } = formData;

    return {
      ...formData,
      branding: removeFalsyValues(branding),
      signUp: signUpFormDataParser.toSignUp(signUp),
      signInMode: createAccountEnabled ? SignInMode.SignInAndRegister : SignInMode.SignIn,
      customCss: customCss?.length ? customCss : null,
    };
  },
};

/**
 * The data parser takes the raw data from the API,
 * - fulfills the default values for the missing fields.
 * - removes the omitted fields from the data, convert the {@link SignInExperience} to the {@link SignInExperiencePageManagedData}
 *
 * This is to ensure the data consistency between the form and the remote model.
 * So it won't trigger the form diff modal when the user hasn't changed anything.
 *
 * Affected fields:
 * - `signUp.secondaryIdentifiers`: This field is optional in the data schema,
 *  but through the form, we always fill it with an empty array.
 * - `mfa`
 * - `passwordPolicy`
 * - `captchaPolicy`
 * - `sentinelPolicy`
 * - `emailBlocklistPolicy`
 */
export const signInExperienceToUpdatedDataParser = (
  data: SignInExperience
): SignInExperiencePageManagedData => {
  const {
    signUp,
    // Start: Remove the omitted fields from the data
    mfa,
    passwordPolicy,
    captchaPolicy,
    sentinelPolicy,
    emailBlocklistPolicy,
    // End: Remove the omitted fields from the data
    ...rest
  } = data;

  return {
    ...rest,
    signUp: {
      ...signUp,
      secondaryIdentifiers: signUp.secondaryIdentifiers ?? [],
    },
  };
};
