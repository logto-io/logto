import { Languages } from '@logto/phrases';

export enum ConnectorType {
  Email = 'Email',
  SMS = 'SMS',
  Social = 'Social',
}

export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: Record<Languages, string>;
  logo: string;
  description: Record<Languages, string>;
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

export type SendEmailResponse = { EnvId: string; RequestId: string };

export type SendSmsResponse = { BizId: string; Code: string; Message: string; RequestId: string };

export type EmailSendMessageFunction<T = Record<string, unknown>> = (
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<T>;

export type SmsSendMessageFunction<T = Record<string, unknown>> = (
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
  getRequestTimeout?: GetTimeout;
  getTimestamp?: GetTimestamp;
}

export type ValidateConfig<T = Record<string, unknown>> = (config: T) => Promise<void>;

export type GetAuthorizationUri = (redirectUri: string, state: string) => Promise<string>;

export type AccessTokenObject = { accessToken: string } & Record<string, string>;

export type GetAccessToken = (code: string, redirectUri?: string) => Promise<AccessTokenObject>;

export type GetUserInfo = (
  accessTokenObject: AccessTokenObject
) => Promise<{ id: string } & Record<string, string | undefined>>;

export type GetConnectorConfig<T = Record<string, unknown>> = (id: string) => Promise<T>;

export type GetTimeout = () => Promise<number>;

export type GetTimestamp = () => string;
