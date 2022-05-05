import { Language } from '@logto/phrases';
import { z } from 'zod';

export enum ConnectorType {
  Email = 'Email',
  SMS = 'SMS',
  Social = 'Social',
}

export enum ConnectorPlatform {
  General = 'General',
  Native = 'Native',
  NA = 'NotApplied',
  Web = 'Web',
}

const languageGuard = z.nativeEnum(Language);

export const connectorMetadataGuard = z.object({
  id: z.string(),
  type: z.nativeEnum(ConnectorType),
  platform: z.nativeEnum(ConnectorPlatform), // Should be ConnectorPlatform.NA for SmsConnector and EmailConnector
  name: z.record(languageGuard, z.string()),
  logo: z.string(),
  description: z.record(languageGuard, z.string()),
  readme: z.string(),
  configTemplate: z.string(),
});

export type ConnectorMetadata = z.infer<typeof connectorMetadataGuard>;

export enum ConnectorErrorCodes {
  General,
  InsufficientRequestParameters,
  InvalidConfig,
  InvalidResponse,
  TemplateNotFound,
  SocialAuthCodeInvalid,
  SocialAccessTokenInvalid,
}

export class ConnectorError extends Error {
  public code: ConnectorErrorCodes;

  constructor(code: ConnectorErrorCodes, message?: string) {
    super(message);
    this.code = code;
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

type SmsMessageTypes = EmailMessageTypes;

export type EmailSendMessageFunction<T = unknown> = (
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<T>;

export type SmsSendMessageFunction<T = unknown> = (
  phone: string,
  type: keyof SmsMessageTypes,
  payload: SmsMessageTypes[typeof type]
) => Promise<T>;

export interface BaseConnector {
  metadata: ConnectorMetadata;
  validateConfig: ValidateConfig;
  getConfig: GetConnectorConfig;
}

export interface SmsConnector extends BaseConnector {
  sendMessage: SmsSendMessageFunction;
}

export interface EmailConnector extends BaseConnector {
  sendMessage: EmailSendMessageFunction;
}

export interface SocialConnector extends BaseConnector {
  getAuthorizationUri: GetAuthorizationUri;
  getAccessToken: GetAccessToken;
  getUserInfo: GetUserInfo;
}

export type ValidateConfig<T = Record<string, unknown>> = (config: T) => Promise<void>;

export type GetAuthorizationUri = (redirectUri: string, state: string) => Promise<string>;

export type AccessTokenObject = { accessToken: string } & Record<string, string>;

export type GetAccessToken = (code: string, redirectUri?: string) => Promise<AccessTokenObject>;

export type GetUserInfo = (
  accessTokenObject: AccessTokenObject
) => Promise<{ id: string } & Record<string, string | undefined>>;

export type GetConnectorConfig<T = Record<string, unknown>> = (id: string) => Promise<T>;
