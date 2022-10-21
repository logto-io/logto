import { generateDarkColor } from '@logto/core-kit';

import type { CreateSignInExperience } from '../db-entries';
import { SignInMode } from '../db-entries';
import { BrandingStyle, SignInMethodState } from '../foundations';

const defaultPrimaryColor = '#6139F6';

export const defaultSignInExperience: Readonly<CreateSignInExperience> = {
  id: 'default',
  color: {
    primaryColor: defaultPrimaryColor,
    isDarkModeEnabled: false,
    darkPrimaryColor: generateDarkColor(defaultPrimaryColor),
  },
  branding: {
    style: BrandingStyle.Logo,
    logoUrl: 'https://logto.io/logo.svg',
    darkLogoUrl: 'https://logto.io/logo-dark.svg',
  },
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: 'en',
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

export const adminConsoleSignInExperience: CreateSignInExperience = {
  ...defaultSignInExperience,
  color: {
    ...defaultSignInExperience.color,
    isDarkModeEnabled: true,
  },
  branding: {
    style: BrandingStyle.Logo_Slogan,
    logoUrl: 'https://logto.io/logo.svg',
    darkLogoUrl: 'https://logto.io/logo-dark.svg',
  },
};
