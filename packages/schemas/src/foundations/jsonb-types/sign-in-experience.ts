import { hexColorRegEx } from '@logto/core-kit';
import { languageTagGuard } from '@logto/language-kit';
import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';

export const colorGuard = z.object({
  primaryColor: z.string().regex(hexColorRegEx),
  isDarkModeEnabled: z.boolean(),
  darkPrimaryColor: z.string().regex(hexColorRegEx),
});

export type Color = z.infer<typeof colorGuard>;

export const brandingGuard = z.object({
  logoUrl: z.string().url().optional(),
  darkLogoUrl: z.string().url().optional(),
  favicon: z.string().url().optional(),
});

export type Branding = z.infer<typeof brandingGuard>;

export const languageInfoGuard = z.object({
  autoDetect: z.boolean(),
  fallbackLanguage: languageTagGuard,
});

export type LanguageInfo = z.infer<typeof languageInfoGuard>;

export enum SignInIdentifier {
  Username = 'username',
  Email = 'email',
  Phone = 'phone',
}

export const signUpGuard = z.object({
  identifiers: z.nativeEnum(SignInIdentifier).array(),
  password: z.boolean(),
  verify: z.boolean(),
});

export type SignUp = z.infer<typeof signUpGuard>;

export const signInGuard = z.object({
  methods: z
    .object({
      identifier: z.nativeEnum(SignInIdentifier),
      password: z.boolean(),
      verificationCode: z.boolean(),
      isPasswordPrimary: z.boolean(),
    })
    .array(),
});

export type SignIn = z.infer<typeof signInGuard>;

export type SocialSignIn = {
  /**
   * If account linking should be performed when a user signs in with a social identity that is new
   * to the system and exactly one existing account is found with the same identifier (e.g., email).
   */
  automaticAccountLinking?: boolean;
};

export const socialSignInGuard = z.object({
  automaticAccountLinking: z.boolean().optional(),
}) satisfies ToZodObject<SocialSignIn>;

export const connectorTargetsGuard = z.string().array();

export type ConnectorTargets = z.infer<typeof connectorTargetsGuard>;

export const customContentGuard = z.record(z.string());

export type CustomContent = z.infer<typeof customContentGuard>;

export enum MfaFactor {
  TOTP = 'Totp',
  WebAuthn = 'WebAuthn',
  BackupCode = 'BackupCode',
}

export const mfaFactorsGuard = z.nativeEnum(MfaFactor).array();

export type MfaFactors = z.infer<typeof mfaFactorsGuard>;

export enum MfaPolicy {
  UserControlled = 'UserControlled',
  Mandatory = 'Mandatory',
}

export const mfaGuard = z.object({
  factors: mfaFactorsGuard,
  policy: z.nativeEnum(MfaPolicy),
});

export type Mfa = z.infer<typeof mfaGuard>;
