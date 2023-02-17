import type { LanguageTag } from '@logto/language-kit';
import { isLanguageTag } from '@logto/language-kit';
import type { ZodType } from 'zod';
import { z } from 'zod';

// MARK: Foundation
export enum ConnectorType {
  Email = 'Email',
  Sms = 'Sms',
  Social = 'Social',
}

export enum ConnectorPlatform {
  Native = 'Native',
  Universal = 'Universal',
  Web = 'Web',
}

export const i18nPhrasesGuard: ZodType<I18nPhrases> = z
  .object({ en: z.string() })
  .and(z.record(z.string()))
  .refine((i18nObject) => {
    const keys = Object.keys(i18nObject);

    if (!keys.includes('en')) {
      return false;
    }

    for (const value of keys) {
      if (!isLanguageTag(value)) {
        return false;
      }
    }

    return true;
  });

type I18nPhrases = { en: string } & {
  [K in Exclude<LanguageTag, 'en'>]?: string;
};

export enum ConnectorErrorCodes {
  General = 'general',
  InvalidMetadata = 'invalid_metadata',
  UnexpectedType = 'unexpected_type',
  InvalidConfigGuard = 'invalid_config_guard',
  InvalidRequestParameters = 'invalid_request_parameters',
  InsufficientRequestParameters = 'insufficient_request_parameters',
  InvalidConfig = 'invalid_config',
  InvalidResponse = 'invalid_response',
  TemplateNotFound = 'template_not_found',
  NotImplemented = 'not_implemented',
  SocialAuthCodeInvalid = 'social_auth_code_invalid',
  SocialAccessTokenInvalid = 'social_invalid_access_token',
  SocialIdTokenInvalid = 'social_invalid_id_token',
  AuthorizationFailed = 'authorization_failed',
}

export class ConnectorError extends Error {
  public code: ConnectorErrorCodes;
  public data: unknown;

  constructor(code: ConnectorErrorCodes, data?: unknown) {
    const message = typeof data === 'string' ? data : 'Connector error occurred.';
    super(message);
    this.code = code;
    this.data = typeof data === 'string' ? { message: data } : data;
  }
}

export enum VerificationCodeType {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
  /** @deprecated */
  Continue = 'Continue',
  Generic = 'Generic',
  Test = 'Test',
}

export const verificationCodeTypeGuard = z.nativeEnum(VerificationCodeType);

// Enum is string actually, keep this exported until GA for compatibility.
/** @deprecated Use `VerificationCodeType` instead. */
export enum MessageType {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
  Continue = 'Continue',
  Test = 'Test',
}

/** @deprecated Use `verificationCodeTypeGuard` instead. */
export const messageTypesGuard = verificationCodeTypeGuard;

export enum ConnectorConfigFormItemType {
  Text = 'Text',
  Number = 'Number',
  MultilineText = 'MultilineText',
  Switch = 'Switch',
  Select = 'Select',
  Json = 'Json',
}

const baseConfigFormItem = {
  key: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  showConditions: z
    .array(z.object({ targetKey: z.string(), expectValue: z.unknown().optional() }))
    .optional(),
};

const connectorConfigFormItemGuard = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(ConnectorConfigFormItemType.Select),
    selectItems: z.array(z.object({ value: z.string(), title: z.string() })),
    ...baseConfigFormItem,
  }),
  z.object({
    type: z.enum([
      ConnectorConfigFormItemType.Text,
      ConnectorConfigFormItemType.Number,
      ConnectorConfigFormItemType.MultilineText,
      ConnectorConfigFormItemType.Switch,
      ConnectorConfigFormItemType.Json,
    ]),
    ...baseConfigFormItem,
  }),
]);

export type ConnectorConfigFormItem = z.infer<typeof connectorConfigFormItemGuard>;

const connectorMetadataGuard = z.object({
  id: z.string(),
  target: z.string(),
  platform: z.nativeEnum(ConnectorPlatform).nullable(),
  name: i18nPhrasesGuard,
  logo: z.string(),
  logoDark: z.string().nullable(),
  description: i18nPhrasesGuard,
  isStandard: z.boolean().optional(),
  readme: z.string(),
  configTemplate: z.string().optional(),
  formItems: connectorConfigFormItemGuard.array().optional(),
});

export const configurableConnectorMetadataGuard = connectorMetadataGuard
  .pick({
    target: true,
    name: true,
    logo: true,
    logoDark: true,
  })
  .partial();

export type ConnectorMetadata = z.infer<typeof connectorMetadataGuard>;

export type ConfigurableConnectorMetadata = z.infer<typeof configurableConnectorMetadataGuard>;

export const connectorSessionGuard = z
  .object({
    nonce: z.string(),
    redirectUri: z.string(),
    connectorId: z.string(),
    connectorFactoryId: z.string(),
    jti: z.string(),
    state: z.string(),
  })
  .partial()
  /**
   * Accept arbitrary unspecified keys so developers who can not publish @logto/connector-kit can more flexibly utilize connector session.
   */
  .catchall(z.unknown());

export type ConnectorSession = z.infer<typeof connectorSessionGuard>;

export type GetSession = () => Promise<ConnectorSession>;

export type SetSession = (storage: ConnectorSession) => Promise<void>;

// https://github.com/colinhacks/zod#json-type
const literalGuard = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type Literal = z.infer<typeof literalGuard>;

export type JsonStorageValue = Literal | { [key: string]: JsonStorageValue } | JsonStorageValue[];

export const jsonStorageValueGuard: z.ZodType<JsonStorageValue> = z.lazy(() =>
  z.union([literalGuard, z.array(jsonStorageValueGuard), z.record(jsonStorageValueGuard)])
);

export const storageGuard = z.record(jsonStorageValueGuard);

export type Storage = z.infer<typeof storageGuard>;

export type GetStorageValue = (key: string) => Promise<JsonStorageValue>;

export type SetStorageValue = (key: string, value: JsonStorageValue) => Promise<Storage>;

export type BaseConnector<Type extends ConnectorType> = {
  type: Type;
  metadata: ConnectorMetadata;
  configGuard: ZodType;
};

export type CreateConnector<T extends BaseConnector<ConnectorType>> = (options: {
  getConfig: GetConnectorConfig;
}) => Promise<T>;

export type GetConnectorConfig = (id: string) => Promise<unknown>;

export type AllConnector = SmsConnector | EmailConnector | SocialConnector;

// MARK: SMS + Email connector
export type SmsConnector = BaseConnector<ConnectorType.Sms> & {
  sendMessage: SendMessageFunction;
};

export type EmailConnector = BaseConnector<ConnectorType.Email> & {
  sendMessage: SendMessageFunction;
};

export type SendMessageFunction = (
  data: { to: string; type: VerificationCodeType; payload: { code: string } },
  config?: unknown
) => Promise<unknown>;

// MARK: Social connector
export type SocialConnector = BaseConnector<ConnectorType.Social> & {
  getAuthorizationUri: GetAuthorizationUri;
  getUserInfo: GetUserInfo;
  validateSamlAssertion?: ValidateSamlAssertion;
};

// This type definition is for SAML connector
export type ValidateSamlAssertion = (
  assertion: Record<string, unknown>,
  getSession: GetSession,
  setSession: SetSession
) => Promise<string>;

export type GetAuthorizationUri = (
  payload: {
    state: string;
    redirectUri: string;
    connectorId: string;
    connectorFactoryId: string;
    jti: string;
    headers: { userAgent?: string };
  },
  setSession: SetSession
) => Promise<string>;

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;

export type GetUserInfo = (
  data: unknown,
  getSession: GetSession,
  storage: { set: SetStorageValue; get: GetStorageValue }
) => Promise<SocialUserInfo & Record<string, string | boolean | number | undefined>>;
