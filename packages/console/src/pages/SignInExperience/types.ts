import { Language } from '@logto/phrases';
import { SignInExperience, SignInMethodKey } from '@logto/schemas';

export enum LanguageMode {
  Auto = 'Auto',
  Fixed = 'Fixed',
}

export type SignInExperienceForm = Omit<SignInExperience, 'signInMethods' | 'languageInfo'> & {
  signInMethods: {
    primary?: SignInMethodKey;
    enableSecondary: boolean;
    username: boolean;
    sms: boolean;
    email: boolean;
    social: boolean;
  };
  languageInfo: {
    mode: LanguageMode;
    fixedLanguage: Language;
    fallbackLanguage: Language;
  };
  createAccountEnabled: boolean;
};
