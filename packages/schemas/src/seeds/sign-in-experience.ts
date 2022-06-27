import { Language } from '@logto/ui-phrases/lib/types.js';

import { CreateSignInExperience, SignInMode } from '../db-entries';
import { BrandingStyle, SignInMethodState } from '../foundations';

export const defaultSignInExperience: Readonly<CreateSignInExperience> = {
  id: 'default',
  color: {
    primaryColor: '#6139F6',
    isDarkModeEnabled: true,
    darkPrimaryColor: '#6139F6',
  },
  branding: {
    style: BrandingStyle.Logo,
    logoUrl: '',
    darkLogoUrl: '',
  },
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: Language.English,
    fixedLanguage: Language.English,
  },
  termsOfUse: {
    enabled: false,
  },
  signInMethods: {
    username: SignInMethodState.Primary,
    email: SignInMethodState.Disabled,
    sms: SignInMethodState.Disabled,
    social: SignInMethodState.Disabled,
  },
  socialSignInConnectorTargets: [],
  signInMode: SignInMode.SignInAndRegister,
};

export const adminConsoleSignInMethods = {
  username: SignInMethodState.Primary,
  email: SignInMethodState.Disabled,
  sms: SignInMethodState.Disabled,
  social: SignInMethodState.Disabled,
};
