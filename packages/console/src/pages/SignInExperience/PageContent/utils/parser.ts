import { passwordPolicyGuard } from '@logto/core-kit';
import {
  SignInMode,
  type SignInExperience,
  type SignUp,
  type SignInIdentifier,
} from '@logto/schemas';
import { conditional, isSameArray } from '@silverhand/essentials';

import {
  type UpdateSignInExperienceData,
  type SignInExperienceForm,
  type SignUpForm,
  type SignUpIdentifier,
} from '../../types';
import { signUpIdentifiersMapping } from '../constants';

const mapIdentifiersToSignUpIdentifier = (identifiers: SignInIdentifier[]): SignUpIdentifier => {
  for (const [signUpIdentifier, mappedIdentifiers] of Object.entries(signUpIdentifiersMapping)) {
    if (isSameArray(identifiers, mappedIdentifiers)) {
      // eslint-disable-next-line no-restricted-syntax
      return signUpIdentifier as SignUpIdentifier;
    }
  }
  throw new Error('Invalid identifiers in the sign up settings.');
};

export const signUpFormDataParser = {
  fromSignUp: (data: SignUp): SignUpForm => {
    const { identifiers, ...signUpData } = data;

    return {
      identifier: mapIdentifiersToSignUpIdentifier(identifiers),
      ...signUpData,
    };
  },
  toSignUp: (formData: SignUpForm): SignUp => {
    const { identifier, ...signUpFormData } = formData;

    return {
      identifiers: signUpIdentifiersMapping[identifier],
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
        ...branding,
        logoUrl: branding.logoUrl ?? '',
        darkLogoUrl: branding.darkLogoUrl ?? '',
        favicon: branding.favicon ?? '',
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
      branding: {
        ...branding,
        // Transform empty string to undefined
        favicon: conditional(branding.favicon?.length && branding.favicon),
        logoUrl: conditional(branding.logoUrl?.length && branding.logoUrl),
        darkLogoUrl: conditional(branding.darkLogoUrl?.length && branding.darkLogoUrl),
      },
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
