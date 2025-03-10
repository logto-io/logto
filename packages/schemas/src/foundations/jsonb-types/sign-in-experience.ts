import { hexColorRegEx } from '@logto/core-kit';
import { languageTagGuard } from '@logto/language-kit';
import { z } from 'zod';

import { Theme } from '../../types/theme.js';
import { type ToZodObject } from '../../utils/zod.js';

export const colorGuard = z.object({
  primaryColor: z.string().regex(hexColorRegEx),
  isDarkModeEnabled: z.boolean(),
  darkPrimaryColor: z.string().regex(hexColorRegEx),
});

export type Color = z.infer<typeof colorGuard>;

export const partialColorGuard = colorGuard.partial();

export type PartialColor = Partial<Color>;

/** Maps a theme to the key of the logo URL in the {@link Branding} object. */
export const themeToLogoKey = Object.freeze({
  [Theme.Light]: 'logoUrl',
  [Theme.Dark]: 'darkLogoUrl',
} satisfies Record<Theme, keyof Branding>);

export const brandingGuard = z
  .object({
    logoUrl: z.string().url(),
    darkLogoUrl: z.string().url(),
    favicon: z.string().url(),
    darkFavicon: z.string().url(),
  })
  .partial();

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

export const signInIdentifierGuard = z.nativeEnum(SignInIdentifier);

export enum AdditionalIdentifier {
  UserId = 'userId',
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
  /** @deprecated, use `PromptAtSignInAndSignUp` instead */
  UserControlled = 'UserControlled',
  /** MFA is required for all users */
  Mandatory = 'Mandatory',
  /** Ask users to set up MFA on their sign-in after registration (skippable, one-time prompt) */
  PromptOnlyAtSignIn = 'PromptOnlyAtSignIn',
  /** Ask users to set up MFA during registration (skippable, one-time prompt) */
  PromptAtSignInAndSignUp = 'PromptAtSignInAndSignUp',
  /** Do not ask users to set up MFA */
  NoPrompt = 'NoPrompt',
}

export enum OrganizationRequiredMfaPolicy {
  /** Do not ask users to set up MFA */
  NoPrompt = 'NoPrompt',
  /** MFA is required for all users */
  Mandatory = 'Mandatory',
}

export type Mfa = {
  /** Enabled MFA factors */
  factors: MfaFactor[];
  /** Global MFA prompt policy */
  policy: MfaPolicy;
  /**
   * The MFA policy for organization level MFA settings.
   *
   * @remarks
   * This policy is used to determine the MFA prompt behavior
   * when the user is associated with one or more organizations that
   * require MFA.
   *
   * @remarks
   * For backward compatibility, if this policy is not set,
   * the default behavior is {@link OrganizationRequiredMfaPolicy.NoPrompt}.
   *
   * @remarks
   * Regardless of this policy setting, the user will always be rejected
   * when request for an organization access_token if the user has not set up MFA.
   */
  organizationRequiredMfaPolicy?: OrganizationRequiredMfaPolicy;
};

export const mfaGuard = z.object({
  factors: mfaFactorsGuard,
  policy: z.nativeEnum(MfaPolicy),
  organizationRequiredMfaPolicy: z.nativeEnum(OrganizationRequiredMfaPolicy).optional(),
}) satisfies ToZodObject<Mfa>;

export const customUiAssetsGuard = z.object({
  id: z.string(),
  createdAt: z.number(),
});

export type CustomUiAssets = z.infer<typeof customUiAssetsGuard>;

export const captchaPolicyGuard = z.object({
  signIn: z.boolean().optional(),
  signUp: z.boolean().optional(),
  forgotPassword: z.boolean().optional(),
});

export type CaptchaPolicy = z.infer<typeof captchaPolicyGuard>;
