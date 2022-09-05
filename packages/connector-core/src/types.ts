import type { LanguageKey } from '@logto/shared';
import { Nullable } from '@silverhand/essentials';
import { z, ZodType } from 'zod';

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

type I18nPhrases = { en: string } & {
  [K in Exclude<LanguageKey, 'en'>]?: string;
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

export enum MessageTypes {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
  Test = 'Test',
}

export const messageTypesGuard = z.nativeEnum(MessageTypes);

export type ConnectorMetadata = {
  id: string;
  target: string;
  platform: Nullable<ConnectorPlatform>;
  name: I18nPhrases;
  logo: string;
  logoDark: Nullable<string>;
  description: I18nPhrases;
  readme: string;
  configTemplate: string;
};

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
  data: { to: string; type: MessageTypes; payload: { code: string } },
  config?: unknown
) => Promise<unknown>;

// MARK: Social connector
export type SocialConnector = BaseConnector<ConnectorType.Social> & {
  getAuthorizationUri: GetAuthorizationUri;
  getUserInfo: GetUserInfo;
};

export type GetAuthorizationUri = (payload: {
  state: string;
  redirectUri: string;
}) => Promise<string>;

export type GetUserInfo = (
  data: unknown
) => Promise<{ id: string } & Record<string, string | undefined>>;
