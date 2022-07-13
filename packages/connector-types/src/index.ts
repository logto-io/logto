import { Language } from '@logto/phrases';
import { Nullable } from '@silverhand/essentials';
import { z } from 'zod';

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

export interface ConnectorMetadata {
  id: string;
  target: string;
  type: ConnectorType;
  platform: Nullable<ConnectorPlatform>;
  name: Record<Language, string>;
  logo: string;
  logoDark: Nullable<string>;
  description: Record<Language, string>;
  readme: string;
  configTemplate: string;
}

export enum ConnectorErrorCodes {
  General,
  InsufficientRequestParameters,
  InvalidConfig,
  InvalidResponse,
  TemplateNotFound,
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
  payload: EmailMessageTypes[typeof type],
  config?: Record<string, unknown>
) => Promise<T>;

export type SmsSendMessageFunction<T = unknown> = (
  phone: string,
  type: keyof SmsMessageTypes,
  payload: SmsMessageTypes[typeof type],
  config?: Record<string, unknown>
) => Promise<T>;

export interface BaseConnector<T = unknown> {
  metadata: ConnectorMetadata;
  validateConfig: ValidateConfig<T>;
  getConfig: GetConnectorConfig;
}

export interface SmsConnector<T = unknown> extends BaseConnector<T> {
  sendMessage: SmsSendMessageFunction;
}

export interface EmailConnector<T = unknown> extends BaseConnector<T> {
  sendMessage: EmailSendMessageFunction;
}

export interface SocialConnector<T = unknown> extends BaseConnector<T> {
  getAuthorizationUri: GetAuthorizationUri;
  getUserInfo: GetUserInfo;
}

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
