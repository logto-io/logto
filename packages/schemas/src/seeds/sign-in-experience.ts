import { Language } from '@logto/phrases';

import { CreateSignInExperience } from '../db-entries';
import { BrandingStyle, SignInMethodState } from '../foundations';

export const defaultSignInExperience: Readonly<CreateSignInExperience> = {
  id: 'default',
  branding: {
    primaryColor: '#6139F6',
    isDarkModeEnabled: false,
    darkPrimaryColor: '#6139F6',
    style: BrandingStyle.Logo,
    logoUrl: 'https://logto.io/logo.svg',
    darkLogoUrl: 'https://logto.io/logo.svg',
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
};
