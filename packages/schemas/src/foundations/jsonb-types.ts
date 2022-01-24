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
 * Connectors
 */

// TODO: support empty shape of object
export const connectorConfigGuard = z.object({});

export type ConnectorConfig = z.infer<typeof connectorConfigGuard>;

/**
 * Settings
 */

export const adminConsoleConfigGuard = z.object({
  applicationSkipGetStarted: z.boolean(),
});

export type AdminConsoleConfig = z.infer<typeof adminConsoleConfigGuard>;

/**
 * SignIn Experience
 */

export const companyInfoGuard = z.object({
  name: z.string(),
  logo: z.string(),
});

export type CompanyInfo = z.infer<typeof companyInfoGuard>;

export enum BrandingStyle {
  companylogo_companyname_appname = 'cl-cn-an',
  companylogo_applogo_campanyname_appname = 'cl-al-cn-an',
  applogo_campanyname_appname = 'al-cn-an',
}

export const brandingGuard = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  darkMode: z.boolean(),
  darkPrimaryColor: z.string(),
  darkBackgroundColoe: z.string(),
  style: z.nativeEnum(BrandingStyle),
});

export type Branding = z.infer<typeof brandingGuard>;

export const termsOfUseGuard = z.object({
  enabled: z.boolean(),
  content: z.string().optional(),
  contentUrl: z.string().optional(),
});

export type TermsOfUse = z.infer<typeof termsOfUseGuard>;

export enum Language {
  english = 'en',
  chinese = 'zh-cn',
}

export const localizationGuard = z.object({
  autoDetect: z.boolean(),
  primaryLanguage: z.nativeEnum(Language),
  fallbackLandguage: z.nativeEnum(Language),
});

export type Localization = z.infer<typeof localizationGuard>;

export const signInMethodSettingsGuard = z.object({
  primary: z.string().array().nonempty().max(3),
  secondary: z.string().array(),
  disabled: z.string().array(),
});

export type SignInMethodSettings = z.infer<typeof signInMethodSettingsGuard>;

export const signInMethodMetadataGuard = z.object({
  connectorId: z.string().optional(),
});

export type SignInMethodMetadata = z.infer<typeof signInMethodMetadataGuard>;
