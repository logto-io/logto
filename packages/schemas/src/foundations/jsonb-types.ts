import { hexColorRegEx } from '@logto/core-kit';
import { languageTagGuard } from '@logto/language-kit';
import { z } from 'zod';

export {
  configurableConnectorMetadataGuard,
  storageGuard,
  type ConfigurableConnectorMetadata,
  type Storage,
} from '@logto/connector-kit';

/* === Commonly Used === */

export const arbitraryObjectGuard = z.record(z.unknown());

export type ArbitraryObject = z.infer<typeof arbitraryObjectGuard>;

/* === OIDC Model Instances === */

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
  TenantId = 'tenantId',
}

export const customClientMetadataGuard = z.object({
  [CustomClientMetadataKey.CorsAllowedOrigins]: z.string().url().array().optional(),
  [CustomClientMetadataKey.IdTokenTtl]: z.number().optional(),
  [CustomClientMetadataKey.RefreshTokenTtl]: z.number().optional(),
  [CustomClientMetadataKey.TenantId]: z.string().optional(),
});

export type CustomClientMetadata = z.infer<typeof customClientMetadataGuard>;

/* === Users === */
export const roleNamesGuard = z.string().array();

const identityGuard = z.object({
  userId: z.string(),
  details: z.object({}).optional(), // Connector's userinfo details, schemaless
});
export const identitiesGuard = z.record(identityGuard);

export type Identity = z.infer<typeof identityGuard>;
export type Identities = z.infer<typeof identitiesGuard>;

/* === SignIn Experiences === */

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

export const connectorTargetsGuard = z.string().array();

export type ConnectorTargets = z.infer<typeof connectorTargetsGuard>;

export const customContentGuard = z.record(z.string());

export type CustomContent = z.infer<typeof customContentGuard>;

/* === Phrases === */

export type Translation = {
  [key: string]: string | Translation;
};

export const translationGuard: z.ZodType<Translation> = z.lazy(() =>
  z.record(z.string().or(translationGuard))
);

/* === Logs === */

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

export const logContextPayloadGuard = z
  .object({
    key: z.string(),
    result: z.nativeEnum(LogResult),
    error: z.record(z.string(), z.unknown()).or(z.string()).optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    userId: z.string().optional(),
    applicationId: z.string().optional(),
    sessionId: z.string().optional(),
  })
  .catchall(z.unknown());

/**
 * The basic log context type. It's more about a type hint instead of forcing the log shape.
 *
 * Note when setting up a log function, the type of log key in function arguments should be `LogKey`.
 * Here we use `string` to make it compatible with the Zod guard.
 **/
export type LogContextPayload = z.infer<typeof logContextPayloadGuard>;

/* === Hooks === */

export enum HookEvent {
  PostRegister = 'PostRegister',
  PostSignIn = 'PostSignIn',
  PostResetPassword = 'PostResetPassword',
}

export const hookEventGuard: z.ZodType<HookEvent> = z.nativeEnum(HookEvent);

export type HookConfig = {
  /** We don't need `type` since v1 only has web hook */
  // type: 'web';
  /** Method fixed to `POST` */
  url: string;
  /** Additional headers that attach to the request */
  headers?: Record<string, string>;
  /**
   * Retry times when hook response status >= 500.
   *
   * Must be less than or equal to `3`. Use `0` to disable retry.
   **/
  retries: number;
};

export const hookConfigGuard: z.ZodType<HookConfig> = z.object({
  url: z.string(),
  headers: z.record(z.string()).optional(),
  retries: z.number().gte(0).lte(3),
});
