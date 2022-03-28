import { z } from 'zod';

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

export const oidcClientMetadataGuard = z.object({
  redirectUris: z.string().array(),
  postLogoutRedirectUris: z.string().array(),
  logoUri: z.string().optional(),
});

export type OidcClientMetadata = z.infer<typeof oidcClientMetadataGuard>;

export enum CustomClientMetadataType {
  idTokenTtl = 'idTokenTtl',
  refreshTokenTtl = 'refreshTokenTtl',
}

export const customClientMetadataGuard = z.object({
  [CustomClientMetadataType.idTokenTtl]: z.number().optional(),
  [CustomClientMetadataType.refreshTokenTtl]: z.number().optional(),
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
 * User Logs
 */

export const userLogPayloadGuard = z.object({
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  applicationId: z.string().optional(),
  applicationName: z.string().optional(),
  details: z.object({}).optional(), // NOT intend to be parsed
});

export type UserLogPayload = z.infer<typeof userLogPayloadGuard>;

/**
 * Settings
 */

export const adminConsoleConfigGuard = z.object({
  applicationSkipGetStarted: z.boolean(),
});

export type AdminConsoleConfig = z.infer<typeof adminConsoleConfigGuard>;

/**
 * SignIn Experiences
 */

export enum BrandingStyle {
  Logo = 'Logo',
  Logo_Slogan = 'Logo_Slogan',
}

export const brandingGuard = z.object({
  primaryColor: z.string().nonempty(),
  backgroundColor: z.string().nonempty(),
  darkMode: z.boolean(),
  darkPrimaryColor: z.string().nonempty(),
  darkBackgroundColor: z.string().nonempty(),
  style: z.nativeEnum(BrandingStyle),
  logoUrl: z.string().url(),
  slogan: z.string().nonempty().optional(),
});

export type Branding = z.infer<typeof brandingGuard>;

export const termsOfUseGuard = z.object({
  enabled: z.boolean(),
  contentUrl: z.string().url().optional(),
});

export type TermsOfUse = z.infer<typeof termsOfUseGuard>;

export enum Language {
  english = 'en',
  chinese = 'zh-cn',
}

export const languageInfoGuard = z.object({
  autoDetect: z.boolean(),
  fallbackLanguage: z.nativeEnum(Language),
  fixedLanguage: z.nativeEnum(Language),
});

export type LanguageInfo = z.infer<typeof languageInfoGuard>;

export enum SignInMethodState {
  primary = 'primary',
  secondary = 'secondary',
  disabled = 'disabled',
}

export const signInMethodsGuard = z.object({
  username: z.nativeEnum(SignInMethodState),
  email: z.nativeEnum(SignInMethodState),
  sms: z.nativeEnum(SignInMethodState),
  social: z.nativeEnum(SignInMethodState),
});

export type SignInMethods = z.infer<typeof signInMethodsGuard>;

export const connectorIdsGuard = z.string().array();

export type ConnectorIds = z.infer<typeof connectorIdsGuard>;

/**
 * Commonly Used
 */

export const arbitraryObjectGuard = z.object({}).catchall(z.unknown());

export type ArbitraryObject = z.infer<typeof arbitraryObjectGuard>;
