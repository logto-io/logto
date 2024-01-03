import { passwordPolicyGuard } from '@logto/core-kit';
import { SignInMode, type SignInExperience, type SignUp, SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { signUpIdentifiersMapping } from '../constants';
import {
  type UpdateSignInExperienceData,
  type SignInExperienceForm,
  type SignUpForm,
} from '../types';

import { mapIdentifiersToSignUpIdentifier } from './identifier';

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
      signUp: signUp
        ? signUpFormDataParser.toSignUp(signUp)
        : {
            identifiers: [SignInIdentifier.Username],
            password: true,
            verify: false,
          },
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
