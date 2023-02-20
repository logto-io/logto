import { generateDarkColor } from '@logto/core-kit';

import type { SignInExperience } from '../db-entries/index.js';
import { SignInMode } from '../db-entries/index.js';
import { BrandingStyle, SignInIdentifier } from '../foundations/index.js';
import { defaultTenantId } from './tenant.js';

const defaultPrimaryColor = '#6139F6';

export const defaultSignInExperience: Readonly<SignInExperience> = {
  tenantId: defaultTenantId,
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
  termsOfUseUrl: null,
  signUp: {
    identifiers: [SignInIdentifier.Username],
    password: true,
    verify: false,
  },
  signIn: {
    methods: [
      {
        identifier: SignInIdentifier.Username,
        password: true,
        verificationCode: false,
        isPasswordPrimary: true,
      },
    ],
  },
  socialSignInConnectorTargets: [],
  signInMode: SignInMode.SignInAndRegister,
  customCss: null,
};

export const adminConsoleSignInExperience: Readonly<SignInExperience> = Object.freeze({
  ...defaultSignInExperience,
  color: {
    ...defaultSignInExperience.color,
    isDarkModeEnabled: true,
  },
  branding: {
    style: BrandingStyle.Logo_Slogan,
    logoUrl: 'https://logto.io/logo.svg',
    darkLogoUrl: 'https://logto.io/logo-dark.svg',
    slogan: 'admin_console.welcome.title', // TODO: @simeng should we programmatically support an i18n key for slogan?
  },
});
