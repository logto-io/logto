import {
  type PasswordPolicy,
  hexColorRegEx,
  passwordPolicyGuard,
  validateRedirectUrl,
} from '@logto/core-kit';
import { languageTagGuard } from '@logto/language-kit';
import { type DeepPartial } from '@silverhand/essentials';
import type { Json } from '@withtyped/server';
import { z } from 'zod';

export {
  configurableConnectorMetadataGuard,
  type ConfigurableConnectorMetadata,
} from '@logto/connector-kit';
export type { Json, JsonObject } from '@withtyped/server';

/* === Commonly Used === */

// Copied from https://github.com/colinhacks/zod#json-type
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const jsonGuard: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonGuard), z.record(jsonGuard)])
);

export const jsonObjectGuard = z.record(jsonGuard);

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
  /** @deprecated Use {@link RefreshTokenTtlInDays} instead. */
  RefreshTokenTtl = 'refreshTokenTtl',
  RefreshTokenTtlInDays = 'refreshTokenTtlInDays',
  TenantId = 'tenantId',
  /**
   * Enabling this configuration will allow Logto to always issue Refresh Tokens, regardless of whether `prompt=consent` is presented in the authentication request.
   *
   * It only works for web applications when the client allowed grant types includes `refresh_token`.
   *
   * This config is for the third-party integrations that do not strictly follow OpenID Connect standards due to some reasons (e.g. they only know OAuth, but requires a Refresh Token to be returned anyway).
   */
  AlwaysIssueRefreshToken = 'alwaysIssueRefreshToken',
  /**
   * When enabled (default), Logto will issue a new Refresh Token for token requests when 70% of the original Time to Live (TTL) has passed.
   *
   * It can be turned off for only traditional web apps for enhanced security.
   */
  RotateRefreshToken = 'rotateRefreshToken',
}

export const customClientMetadataGuard = z.object({
  [CustomClientMetadataKey.CorsAllowedOrigins]: z.string().min(1).array().optional(),
  [CustomClientMetadataKey.IdTokenTtl]: z.number().optional(),
  [CustomClientMetadataKey.RefreshTokenTtl]: z.number().optional(),
  [CustomClientMetadataKey.RefreshTokenTtlInDays]: z.number().int().min(1).max(90).optional(),
  [CustomClientMetadataKey.TenantId]: z.string().optional(),
  [CustomClientMetadataKey.AlwaysIssueRefreshToken]: z.boolean().optional(),
  [CustomClientMetadataKey.RotateRefreshToken]: z.boolean().optional(),
} satisfies Record<CustomClientMetadataKey, z.ZodType>);

/**
 * @see {@link CustomClientMetadataKey} for key descriptions.
 */
export type CustomClientMetadata = z.infer<typeof customClientMetadataGuard>;

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

export enum MfaFactor {
  TOTP = 'TOTP',
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

/* === Users === */
export const roleNamesGuard = z.string().array();

const identityGuard = z.object({
  userId: z.string(),
  details: z.object({}).optional(), // Connector's userinfo details, schemaless
});
export const identitiesGuard = z.record(identityGuard);

export type Identity = z.infer<typeof identityGuard>;
export type Identities = z.infer<typeof identitiesGuard>;

export const baseMfaVerification = {
  id: z.string(),
  createdAt: z.string(),
};

export const mfaVerificationGuard = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(MfaFactor.TOTP),
    ...baseMfaVerification,
    key: z.string(),
  }),
  z.object({
    type: z.literal(MfaFactor.WebAuthn),
    ...baseMfaVerification,
    credentialId: z.string(),
    publicKey: z.string(),
    counter: z.number(),
    agent: z.string(),
  }),
  z.object({
    type: z.literal(MfaFactor.BackupCode),
    ...baseMfaVerification,
    code: z.string(),
    usedAt: z.date().optional(),
  }),
]);

export type MfaVerification = z.infer<typeof mfaVerificationGuard>;

export const mfaVerificationsGuard = mfaVerificationGuard.array();

export type MfaVerifications = z.infer<typeof mfaVerificationsGuard>;

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

export type PartialPasswordPolicy = DeepPartial<PasswordPolicy>;

export const partialPasswordPolicyGuard = passwordPolicyGuard.deepPartial();

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

export const hookEventsGuard = hookEventGuard.array();

export type HookEvents = z.infer<typeof hookEventsGuard>;

export const hookConfigGuard = z.object({
  /** We don't need `type` since v1 only has web hook */
  // type: 'web';
  /** Method fixed to `POST` */
  url: z.string(),
  /** Additional headers that attach to the request */
  headers: z.record(z.string()).optional(),
  /**
   * @deprecated
   * Retry times when hook response status >= 500.
   * Now the retry times is fixed to 3.
   * Keep for backward compatibility.
   */
  retries: z.number().gte(0).lte(3).optional(),
});

export type HookConfig = z.infer<typeof hookConfigGuard>;

/* === Custom domains and Cloudflare === */

export const domainDnsRecordGuard = z.object({
  name: z.string(),
  type: z.string(),
  value: z.string(),
});
export type DomainDnsRecord = z.infer<typeof domainDnsRecordGuard>;
export const domainDnsRecordsGuard = domainDnsRecordGuard.array();
export type DomainDnsRecords = z.infer<typeof domainDnsRecordsGuard>;

// https://developers.cloudflare.com/api/operations/custom-hostname-for-a-zone-list-custom-hostnames#Responses
// Predefine the "useful" fields
export const cloudflareDataGuard = z
  .object({
    id: z.string(),
    status: z.string(),
    ssl: z
      .object({
        status: z.string(),
        validation_errors: z
          .object({
            message: z.string(),
          })
          .catchall(z.unknown())
          .array()
          .optional(),
      })
      .catchall(z.unknown()),
    verification_errors: z.string().array().optional(),
  })
  .catchall(z.unknown());

export type CloudflareData = z.infer<typeof cloudflareDataGuard>;

export enum DomainStatus {
  PendingVerification = 'PendingVerification',
  PendingSsl = 'PendingSsl',
  Active = 'Active',
  Error = 'Error',
}

export const domainStatusGuard = z.nativeEnum(DomainStatus);

/* === Sentinel activities === */

/** The action target type of a sentinel activity. */
export enum SentinelActivityTargetType {
  User = 'User',
  App = 'App',
}
export const sentinelActivityTargetTypeGuard = z.nativeEnum(SentinelActivityTargetType);

/** The action type of a sentinel activity. */
export enum SentinelActivityAction {
  /**
   * The subject tries to pass a verification by inputting a password.
   *
   * For example, a user (subject) who inputted a password (action) to authenticate themselves
   * (target).
   */
  Password = 'Password',
  /**
   * The subject tries to pass a verification by inputting a verification code.
   *
   * For example, a user (subject) who inputted a verification code (action) to authenticate
   * themselves (target).
   */
  VerificationCode = 'VerificationCode',
}
export const sentinelActivityActionGuard = z.nativeEnum(SentinelActivityAction);

export type SentinelActivityPayload = Record<string, unknown>;
export const sentinelActivityPayloadGuard = z.record(
  z.unknown()
) satisfies z.ZodType<SentinelActivityPayload>;
