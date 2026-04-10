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

export enum AlternativeSignUpIdentifier {
  EmailOrPhone = 'emailOrPhone',
}

export type SignUpIdentifier = SignInIdentifier | AlternativeSignUpIdentifier;

type RequiredSignUpIdentifierSettings = {
  identifier: SignUpIdentifier;
  /**
   * For `email` and `phone` identifiers only. If `true`, the user must verify the email or phone number.
   */
  verify?: boolean;
};

/**
 * @example
 * ```ts
 * {
 *  identifiers: ['email', 'phone'],
 *  password: true,
 *  verify: true,
 *  secondaryIdentifiers: [{
 *    identifier: 'username',
 *  }]
 * }
 * ```
 * - Email or phone number is required as the primary identifier.
 * - The user must set up a password.
 * - The user must verify their email or phone number.
 * - In addition to the primary identifier, the user must provide a username.
 *
 * @example
 * ```ts
 * {
 *  identifiers: ['username'],
 *  password: true,
 *  verify: false,
 *  secondaryIdentifiers: [{
 *    identifier: 'emailOrPhone',
 *    verified: true,
 *  }]
 * }
 * ```
 * - Username is required as the primary identifier.
 * - The user must set up a password.
 * - In addition to the primary identifier, the user must provide an email or phone number.
 * - The user must verify the email or phone number.
 */
export type SignUp = {
  /** Primary identifiers that are required to sign up. */
  identifiers: SignInIdentifier[];
  /** Whether the user should set up a password */
  password: boolean;
  /**
   * Whether the user should verify their email or phone number.
   *
   * @remarks
   * This field is only relevant if the `email` or `phone` identifier is required as the primary identifier.
   **/
  verify: boolean;
  /** Secondary identifiers that are required during sign up. */
  secondaryIdentifiers?: RequiredSignUpIdentifierSettings[];
};

export const signUpGuard = z.object({
  identifiers: z.nativeEnum(SignInIdentifier).array(),
  password: z.boolean(),
  verify: z.boolean(),
  secondaryIdentifiers: z
    .object({
      identifier: z.union([signInIdentifierGuard, z.nativeEnum(AlternativeSignUpIdentifier)]),
      verify: z.boolean().optional(),
    })
    .array()
    .optional(),
}) satisfies ToZodObject<SignUp>;

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
  /**
   * If required identifiers (e.g., email, phone) should be skipped during social sign-in.
   * @remarks
   * By default, if a social identity does not provide all required identifiers,
   * the user will be prompted to provide them before completing sign-in.
   *
   * Setting this to `true` will bypass that requirement.
   */
  skipRequiredIdentifiers?: boolean;
};

export const socialSignInGuard = z.object({
  automaticAccountLinking: z.boolean().optional(),
  skipRequiredIdentifiers: z.boolean().optional(),
}) satisfies ToZodObject<SocialSignIn>;

export const connectorTargetsGuard = z.string().array();

export type ConnectorTargets = z.infer<typeof connectorTargetsGuard>;

export const customContentGuard = z.record(z.string());

export type CustomContent = z.infer<typeof customContentGuard>;

export enum MfaFactor {
  TOTP = 'Totp',
  WebAuthn = 'WebAuthn',
  BackupCode = 'BackupCode',
  EmailVerificationCode = 'EmailVerificationCode',
  PhoneVerificationCode = 'PhoneVerificationCode',
}

export const mfaFactorsGuard = z.nativeEnum(MfaFactor).array();

export type MfaFactors = z.infer<typeof mfaFactorsGuard>;

export enum MfaPolicy {
  /** @deprecated, use `PromptAtSignInAndSignUp` instead */
  UserControlled = 'UserControlled',
  /** MFA is required for all users */
  Mandatory = 'Mandatory',
  /** Ask users to set up MFA on their sign-in after registration (skippable, one-time prompt, Optional MFA only) */
  PromptOnlyAtSignIn = 'PromptOnlyAtSignIn',
  /** Ask users to set up MFA during registration (skippable, one-time prompt, Optional MFA only) */
  PromptAtSignInAndSignUp = 'PromptAtSignInAndSignUp',
  /** Do not ask users to set up MFA */
  NoPrompt = 'NoPrompt',
  /** Ask users to set up MFA during registration or at next sign-in (no-skip, Adaptive MFA only) */
  PromptAtSignInAndSignUpMandatory = 'PromptAtSignInAndSignUpMandatory',
  /** Ask users to set up MFA at next sign-in after registration (no-skip, Adaptive MFA only) */
  PromptOnlyAtSignInMandatory = 'PromptOnlyAtSignInMandatory',
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

/**
 * Adaptive MFA configuration for the sign-in experience.
 *
 * @remarks
 * This is a single enable switch for the rule-based Adaptive MFA flow.
 * Use it in Management API sign-in experience updates (`PATCH /api/sign-in-exp`).
 * When enabled, the server evaluates fixed risk rules from request signals
 * (IP, User-Agent, edge-injected headers) and may require MFA verification.
 * If omitted, Adaptive MFA is disabled.
 *
 * @example
 * ```ts
 * {
 *   adaptiveMfa: {
 *     enabled: true,
 *   },
 * }
 * ```
 */
export type AdaptiveMfa = {
  enabled?: boolean;
};

export const adaptiveMfaGuard = z.object({
  enabled: z.boolean().optional(),
}) satisfies ToZodObject<AdaptiveMfa>;

export const customUiAssetsGuard = z.object({
  id: z.string(),
  createdAt: z.number(),
});

export type CustomUiAssets = z.infer<typeof customUiAssetsGuard>;

export const captchaPolicyGuard = z.object({
  enabled: z.boolean().optional(),
});

export type CaptchaPolicy = z.infer<typeof captchaPolicyGuard>;

export type SentinelPolicy = {
  /**
   * Maximum failed attempts allowed in one hour before blocking the user.
   */
  maxAttempts?: number;
  /**
   * Lockout duration in minutes after exceeding the maximum failed attempts.
   */
  lockoutDuration?: number;
};

export const sentinelPolicyGuard = z.object({
  maxAttempts: z.number().optional(),
  lockoutDuration: z.number().optional(),
}) satisfies ToZodObject<SentinelPolicy>;

/**
 * Email blocklist policy.
 *
 * @remarks
 * This policy is used to block specific email addresses or domains from signing up.
 */
export type EmailBlocklistPolicy = {
  blockDisposableAddresses?: boolean;
  blockSubaddressing?: boolean;
  /**
   * Custom blocklist of email addresses or domains.
   *
   * @example
   * Email address: abc@xyx.com
   *
   * @example
   * Domain name: @xyz.com
   */
  customBlocklist?: string[];
};

export const emailBlocklistPolicyGuard = z.object({
  blockDisposableAddresses: z.boolean().optional(),
  blockSubaddressing: z.boolean().optional(),
  customBlocklist: z.string().array().optional(),
}) satisfies ToZodObject<EmailBlocklistPolicy>;

export enum ForgotPasswordMethod {
  EmailVerificationCode = 'EmailVerificationCode',
  PhoneVerificationCode = 'PhoneVerificationCode',
}

export const forgotPasswordMethodsGuard = z.nativeEnum(ForgotPasswordMethod).array();

export type ForgotPasswordMethods = z.infer<typeof forgotPasswordMethodsGuard>;

export type PasskeySignIn = {
  enabled?: boolean;
  showPasskeyButton?: boolean;
  allowAutofill?: boolean;
};

export const passkeySignInGuard = z
  .object({
    enabled: z.boolean(),
    showPasskeyButton: z.boolean(),
    allowAutofill: z.boolean(),
  })
  .partial() satisfies ToZodObject<PasskeySignIn>;

/**
 * Password lifecycle policy for configuring password expiration and rotation.
 *
 * @remarks
 * This policy is evaluated server-side during sign-in (after MFA) to determine
 * whether the user's password has expired or is nearing expiration.
 *
 * - If the password age >= `validPeriodDays`, the sign-in is blocked and the user
 *   must reset their password before continuing.
 * - If the password age is within `reminderPeriodDays` of expiration, the user is
 *   shown a skip-able prompt to reset their password.
 *
 * @remarks
 * For users without a `passwordUpdatedAt` value (legacy accounts), the
 * `createdAt` timestamp is used as a fallback to determine password age.
 */
export type PasswordExpirationPolicy = {
  /**
   * Whether the password expiration policy is enabled.
   * @default false
   */
  enabled?: boolean;
  /**
   * Number of days a password is valid before it expires and the user is
   * forced to reset it on sign-in.
   */
  validPeriodDays?: number;
  /**
   * Number of days before expiration at which the user will be reminded to
   * reset their password. The reminder is skip-able.
   */
  reminderPeriodDays?: number;
};

export const passwordExpirationPolicyGuard = z.object({
  enabled: z.boolean().default(false),
  validPeriodDays: z.number().int().min(1).optional(),
  reminderPeriodDays: z.number().int().min(0).optional(),
}) satisfies ToZodObject<PasswordExpirationPolicy>;
