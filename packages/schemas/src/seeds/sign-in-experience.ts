import { generateDarkColor } from '@logto/core-kit';

import type { SignInExperience } from '../db-entries/index.js';
import { SignInMode } from '../db-entries/index.js';
import { BrandingStyle, SignInIdentifier } from '../foundations/index.js';
import { adminTenantId, defaultTenantId } from './tenant.js';

const defaultPrimaryColor = '#6139F6';

export const createDefaultSignInExperience = (forTenantId: string): Readonly<SignInExperience> =>
  Object.freeze({
    tenantId: forTenantId,
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
      fallbackLanguage: 'en' as const,
    },
    termsOfUseUrl: null,
    privacyPolicyUrl: null,
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
  });

/** @deprecated Use `createDefaultSignInExperience()` instead. */
export const defaultSignInExperience = createDefaultSignInExperience(defaultTenantId);

export const createAdminTenantSignInExperience = (): Readonly<SignInExperience> =>
  Object.freeze({
    ...defaultSignInExperience,
    tenantId: adminTenantId,
    color: {
      ...defaultSignInExperience.color,
      isDarkModeEnabled: true,
    },
    signInMode: SignInMode.Register,
    branding: {
      style: BrandingStyle.Logo_Slogan,
      logoUrl: 'https://logto.io/logo.svg',
      darkLogoUrl: 'https://logto.io/logo-dark.svg',
      slogan: 'admin_console.welcome.title',
    },
  });
