import type { Language } from '@logto/phrases';
import { Nullable } from '@silverhand/essentials';
import { z } from 'zod';

/**
 * Connector is auto-generated in @logto/schemas according to sql file.
 * As @logto/schemas depends on this repo (@logto/connector-types), we manually define Connector type again as a temporary solution.
 */

export const arbitraryObjectGuard = z.union([z.object({}).catchall(z.unknown()), z.object({})]);

export type ArbitraryObject = z.infer<typeof arbitraryObjectGuard>;

export type Connector = {
  id: string;
  enabled: boolean;
  config: ArbitraryObject;
  createdAt: number;
};

export enum ConnectorType {
  Email = 'Email',
  SMS = 'SMS',
  Social = 'Social',
}

export enum ConnectorPlatform {
  Native = 'Native',
  Universal = 'Universal',
  Web = 'Web',
}

type i18nPhrases = { [Language.English]: string } & {
  [key in Exclude<Language, Language.English>]?: string;
};

export interface ConnectorMetadata {
  id: string;
  target: string;
  type: ConnectorType;
  platform: Nullable<ConnectorPlatform>;
  name: i18nPhrases;
  logo: string;
  logoDark: Nullable<string>;
  description: i18nPhrases;
  readme: string;
  configTemplate: string;
}

export enum ConnectorErrorCodes {
  General,
  InsufficientRequestParameters,
  InvalidConfig,
  InvalidResponse,
  TemplateNotFound,
  NotImplemented,
  SocialAuthCodeInvalid,
  SocialAccessTokenInvalid,
  SocialIdTokenInvalid,
  AuthorizationFailed,
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

export type EmailMessageTypes = {
  SignIn: {
    code: string;
  };
  Register: {
    code: string;
  };
  ForgotPassword: {
    code: string;
  };
  Test: Record<string, unknown>;
};

export type SmsMessageTypes = EmailMessageTypes;

export type EmailSendMessageFunction<T = unknown> = (
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<T>;

export type EmailSendTestMessageFunction<T = unknown> = (
  config: Record<string, unknown>,
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<T>;

export type SmsSendMessageFunction<T = unknown> = (
  phone: string,
  type: keyof SmsMessageTypes,
  payload: SmsMessageTypes[typeof type]
) => Promise<T>;

export type SmsSendTestMessageFunction<T = unknown> = (
  config: Record<string, unknown>,
  phone: string,
  type: keyof SmsMessageTypes,
  payload: SmsMessageTypes[typeof type]
) => Promise<T>;

export interface BaseConnector<T = unknown> {
  metadata: ConnectorMetadata;
  getConfig: GetConnectorConfig;
  validateConfig: ValidateConfig<T>;
}

export interface SmsConnector<T = unknown> extends BaseConnector<T> {
  sendMessage: SmsSendMessageFunction;
  sendTestMessage?: SmsSendTestMessageFunction;
}

export interface SmsConnectorInstance<T = unknown> extends SmsConnector<T> {
  connector: Connector;
}

export interface EmailConnector<T = unknown> extends BaseConnector<T> {
  sendMessage: EmailSendMessageFunction;
  sendTestMessage?: EmailSendTestMessageFunction;
}

export interface EmailConnectorInstance<T = unknown> extends EmailConnector<T> {
  connector: Connector;
}

export interface SocialConnector<T = unknown> extends BaseConnector<T> {
  getAuthorizationUri: GetAuthorizationUri;
  getUserInfo: GetUserInfo;
}

export interface SocialConnectorInstance<T = unknown> extends SocialConnector<T> {
  connector: Connector;
}

export type ConnectorInstance =
  | SmsConnectorInstance
  | EmailConnectorInstance
  | SocialConnectorInstance;

export type ValidateConfig<T = unknown> = (config: unknown) => asserts config is T;

export type GetAuthorizationUri = (payload: {
  state: string;
  redirectUri: string;
}) => Promise<string>;

export type GetUserInfo = (
  data: unknown
) => Promise<{ id: string } & Record<string, string | undefined>>;

export type GetConnectorConfig = (id: string) => Promise<unknown>;

export const codeDataGuard = z.object({
  code: z.string(),
});

export type CodeData = z.infer<typeof codeDataGuard>;

export const codeWithRedirectDataGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

export type CodeWithRedirectData = z.infer<typeof codeWithRedirectDataGuard>;
