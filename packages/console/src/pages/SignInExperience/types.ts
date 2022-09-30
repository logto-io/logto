import type { LanguageTag } from '@logto/language-kit';
import { SignInExperience, SignInMethodKey } from '@logto/schemas';
import type { Translation } from '@logto/schemas';

export type SignInExperienceForm = Omit<SignInExperience, 'signInMethods'> & {
  signInMethods: {
    primary?: SignInMethodKey;
    enableSecondary: boolean;
    username: boolean;
    sms: boolean;
    email: boolean;
    social: boolean;
  };
  createAccountEnabled: boolean;
};

export type CustomPhraseResponse = {
  languageTag: LanguageTag;
  translation: Translation;
};
