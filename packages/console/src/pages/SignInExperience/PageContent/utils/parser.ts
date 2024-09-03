import { passwordPolicyGuard } from '@logto/core-kit';
import {
  SignInMode,
  type SignInExperience,
  type SignUp,
  type SignInIdentifier,
} from '@logto/schemas';
import { isSameArray } from '@silverhand/essentials';

import { emptyBranding } from '@/types/sign-in-experience';
import { removeFalsyValues } from '@/utils/object';

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
      customUiAssets,
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
