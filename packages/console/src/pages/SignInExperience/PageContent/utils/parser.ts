import { passwordPolicyGuard } from '@logto/core-kit';
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
  type UpdateSignInExperienceData,
  type SignInExperienceForm,
  type SignUpForm,
} from '../../types';

/**
 * For backward compatibility,
 * we need to safely parse the @see {SignUp['identifiers']} to the @see {SignUpForm['identifiers']} format.
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
    const { signUp, signInMode, customCss, branding, passwordPolicy } = data;

    return {
      ...data,
      signUp: signUpFormDataParser.fromSignUp(signUp),
      createAccountEnabled: signInMode !== SignInMode.SignIn,
      customCss: customCss ?? undefined,
      branding: {
        ...emptyBranding,
        ...branding,
      },
      /** Parse password policy with default values. */
      passwordPolicy: {
        ...passwordPolicyGuard.parse(passwordPolicy),
        customWords: passwordPolicy.rejects?.words?.join('\n') ?? '',
        isCustomWordsEnabled: Boolean(passwordPolicy.rejects?.words?.length),
      },
    };
  },
  toSignInExperience: (formData: SignInExperienceForm): SignInExperience => {
    const {
      branding,
      createAccountEnabled,
      signUp,
      customCss,
      /** Remove the custom words related properties since they are not used in the remote model. */
      passwordPolicy: { isCustomWordsEnabled, customWords, ...passwordPolicy },
    } = formData;

    return {
      ...formData,
      branding: removeFalsyValues(branding),
      signUp: signUpFormDataParser.toSignUp(signUp),
      signInMode: createAccountEnabled ? SignInMode.SignInAndRegister : SignInMode.SignIn,
      customCss: customCss?.length ? customCss : null,
      passwordPolicy: {
        ...passwordPolicy,
        rejects: {
          ...passwordPolicy.rejects,
          words: isCustomWordsEnabled ? customWords.split('\n').filter(Boolean) : [],
        },
      },
    };
  },
  toUpdateSignInExperienceData: (formData: SignInExperienceForm): UpdateSignInExperienceData => ({
    ...sieFormDataParser.toSignInExperience(formData),
    mfa: undefined,
  }),
};
