import { generateDarkColor } from '@logto/core-kit';

import type { CreateSignInExperience } from '../db-entries/index.js';
import { SignInMode } from '../db-entries/index.js';
import { MfaPolicy, SignInIdentifier } from '../foundations/index.js';

import { adminTenantId, defaultTenantId } from './tenant.js';

export const defaultPrimaryColor = '#6139F6';

export const createDefaultSignInExperience = (
  forTenantId: string,
  isCloud: boolean
): Readonly<CreateSignInExperience> =>
  Object.freeze({
    tenantId: forTenantId,
    id: 'default',
    color: {
      primaryColor: defaultPrimaryColor,
      isDarkModeEnabled: false,
      darkPrimaryColor: generateDarkColor(defaultPrimaryColor),
    },
    branding: {
      logoUrl: isCloud ? undefined : 'https://logto.io/logo.svg',
      darkLogoUrl: isCloud ? undefined : 'https://logto.io/logo-dark.svg',
    },
    languageInfo: {
      autoDetect: true,
      fallbackLanguage: 'en' as const,
    },
    termsOfUseUrl: null,
    privacyPolicyUrl: null,
    signUp: {
      identifiers: [isCloud ? SignInIdentifier.Email : SignInIdentifier.Username],
      password: true,
      verify: isCloud,
    },
    signIn: {
      methods: [
        {
          identifier: isCloud ? SignInIdentifier.Email : SignInIdentifier.Username,
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
    customUiAssets: null,
    passwordPolicy: {},
    mfa: {
      factors: [],
      policy: MfaPolicy.UserControlled,
    },
  });

/** @deprecated Use `createDefaultSignInExperience()` instead. */
export const defaultSignInExperience = createDefaultSignInExperience(defaultTenantId, false);

export const createAdminTenantSignInExperience = (): Readonly<CreateSignInExperience> =>
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
