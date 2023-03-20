import { generateDarkColor } from '@logto/core-kit';

import type { SignInExperience } from '../db-entries/index.js';
import { SignInMode } from '../db-entries/index.js';
import { SignInIdentifier } from '../foundations/index.js';
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
      logoUrl: '',
      darkLogoUrl: '',
    },
    languageInfo: {
      autoDetect: true,
      fallbackLanguage: 'en' as const,
    },
    termsOfUseUrl: null,
    privacyPolicyUrl: null,
    signUp: {
      identifiers: [SignInIdentifier.Email],
      password: true,
      verify: true,
    },
    signIn: {
      methods: [
        {
          identifier: SignInIdentifier.Email,
          password: true,
          verificationCode: false,
          isPasswordPrimary: true,
        },
      ],
    },
    socialSignInConnectorTargets: [],
    signInMode: SignInMode.SignInAndRegister,
    customCss: null,
    customContent: {},
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
      logoUrl: 'https://logto.io/logo.svg',
      darkLogoUrl: 'https://logto.io/logo-dark.svg',
    },
  });
