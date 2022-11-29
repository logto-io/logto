import { hexColorRegEx } from '@logto/core-kit';
import { languageTagGuard } from '@logto/language-kit';
import { z } from 'zod';

export {
  configurableConnectorMetadataGuard,
  type ConfigurableConnectorMetadata,
} from '@logto/connector-kit';

/**
 * Commonly Used
 */

// Cannot declare `z.object({}).catchall(z.unknown().optional())` to guard `{ [key: string]?: unknown }` (invalid type),
// so do it another way to guard `{ [x: string]: unknown; } | {}`.
export const arbitraryObjectGuard = z.union([z.object({}).catchall(z.unknown()), z.object({})]);

export type ArbitraryObject = z.infer<typeof arbitraryObjectGuard>;

/**
 * OIDC Model Instances
 */

export const oidcModelInstancePayloadGuard = z
  .object({
    userCode: z.string().optional(),
    uid: z.string().optional(),
    grantId: z.string().optional(),
  })
  /**
   * Try to use `.passthrough()` if type has been fixed.
   * https://github.com/colinhacks/zod/issues/452
   */
  .catchall(z.unknown());

export type OidcModelInstancePayload = z.infer<typeof oidcModelInstancePayloadGuard>;

// Import from @logto/core-kit later, pending for new version publish
export const webRedirectUriProtocolRegEx = /^https?:$/;
export const mobileUriSchemeProtocolRegEx = /^[a-z][\d_a-z]*(\.[\d_a-z]+)+:$/;

export const validateRedirectUrl = (urlString: string, type: 'web' | 'mobile') => {
  try {
    const { protocol } = new URL(urlString);
    const protocolRegEx =
      type === 'mobile' ? mobileUriSchemeProtocolRegEx : webRedirectUriProtocolRegEx;

    return protocolRegEx.test(protocol);
  } catch {
    return false;
  }
};

export const oidcClientMetadataGuard = z.object({
  redirectUris: z
    .string()
    .refine((url) => validateRedirectUrl(url, 'web'))
    .or(z.string().refine((url) => validateRedirectUrl(url, 'mobile')))
    .array(),
  postLogoutRedirectUris: z.string().url().array(),
  logoUri: z.string().optional(),
});

export type OidcClientMetadata = z.infer<typeof oidcClientMetadataGuard>;

export enum CustomClientMetadataKey {
  CorsAllowedOrigins = 'corsAllowedOrigins',
  IdTokenTtl = 'idTokenTtl',
  RefreshTokenTtl = 'refreshTokenTtl',
}

export const customClientMetadataGuard = z.object({
  [CustomClientMetadataKey.CorsAllowedOrigins]: z.string().url().array().optional(),
  [CustomClientMetadataKey.IdTokenTtl]: z.number().optional(),
  [CustomClientMetadataKey.RefreshTokenTtl]: z.number().optional(),
});

export type CustomClientMetadata = z.infer<typeof customClientMetadataGuard>;

/**
 * Users
 */
export const roleNamesGuard = z.string().array();

export type RoleNames = z.infer<typeof roleNamesGuard>;

const identityGuard = z.object({
  userId: z.string(),
  details: z.object({}).optional(), // Connector's userinfo details, schemaless
});
export const identitiesGuard = z.record(identityGuard);

export type Identity = z.infer<typeof identityGuard>;
export type Identities = z.infer<typeof identitiesGuard>;

/**
 * SignIn Experiences
 */

export const colorGuard = z.object({
  primaryColor: z.string().regex(hexColorRegEx),
  isDarkModeEnabled: z.boolean(),
  darkPrimaryColor: z.string().regex(hexColorRegEx),
});

export type Color = z.infer<typeof colorGuard>;

export enum BrandingStyle {
  Logo = 'Logo',
  Logo_Slogan = 'Logo_Slogan',
}

export const brandingGuard = z.object({
  style: z.nativeEnum(BrandingStyle),
  logoUrl: z.string().url(),
  darkLogoUrl: z.string().url().optional(),
  slogan: z.string().optional(),
});

export type Branding = z.infer<typeof brandingGuard>;

export const termsOfUseGuard = z.object({
  enabled: z.boolean(),
  contentUrl: z.string().url().optional().or(z.literal('')),
});

export type TermsOfUse = z.infer<typeof termsOfUseGuard>;

export const languageInfoGuard = z.object({
  autoDetect: z.boolean(),
  fallbackLanguage: languageTagGuard,
});

export type LanguageInfo = z.infer<typeof languageInfoGuard>;

export enum SignInExperienceIdentifier {
  Username = 'username',
  Email = 'email',
  Sms = 'sms',
}

// Todo: @xiaoyijun deprecate this type
export enum SignUpIdentifier {
  Email = 'email',
  Sms = 'sms',
  Username = 'username',
  EmailOrSms = 'emailOrSms',
  None = 'none',
}

// Todo: @xiaoyijun deprecate this type
export enum SignInIdentifier {
  Email = 'email',
  Sms = 'sms',
  Username = 'username',
}

export const signUpGuard = z.object({
  identifiers: z.nativeEnum(SignInExperienceIdentifier).array(),
  password: z.boolean(),
  verify: z.boolean(),
});

export type SignUp = z.infer<typeof signUpGuard>;

export const signInGuard = z.object({
  methods: z
    .object({
      identifier: z.nativeEnum(SignInExperienceIdentifier),
      password: z.boolean(),
      verificationCode: z.boolean(),
      isPasswordPrimary: z.boolean(),
    })
    .array(),
});

export type SignIn = z.infer<typeof signInGuard>;

export const connectorTargetsGuard = z.string().array();

export type ConnectorTargets = z.infer<typeof connectorTargetsGuard>;

/**
 * Settings
 */

export enum AppearanceMode {
  SyncWithSystem = 'system',
  LightMode = 'light',
  DarkMode = 'dark',
}

export const adminConsoleConfigGuard = z.object({
  // Get started challenges
  demoChecked: z.boolean(),
  applicationCreated: z.boolean(),
  signInExperienceCustomized: z.boolean(),
  passwordlessConfigured: z.boolean(),
  socialSignInConfigured: z.boolean(),
  furtherReadingsChecked: z.boolean(),
});

export type AdminConsoleConfig = z.infer<typeof adminConsoleConfigGuard>;

/**
 * Phrases
 */

export type Translation = {
  [key: string]: string | Translation;
};

export const translationGuard: z.ZodType<Translation> = z.lazy(() =>
  z.record(z.string().or(translationGuard))
);
