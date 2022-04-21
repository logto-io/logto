import { Languages } from '@logto/phrases';
import { ArbitraryObject, Connector, ConnectorType } from '@logto/schemas';

import { Response } from './aliyun';

export * from './aliyun';

export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: Record<Languages, string>;
  logo: string;
  description: Record<Languages, string>;
  readme: string;
  configTemplate: string;
}

export interface ConnectorDTO extends Connector {
  metadata: ConnectorMetadata;
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

export type EmailSendMessageFunction<
  T1 extends ArbitraryObject = ArbitraryObject,
  T2 = Response<T1>
> = (
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<T2>;

export type SmsSendMessageFunction<
  T1 extends ArbitraryObject = ArbitraryObject,
  T2 = Response<T1>
> = (
  phone: string,
  type: keyof SmsMessageTypes,
  payload: SmsMessageTypes[typeof type]
) => Promise<T2>;

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

export type ValidateConfig<T extends ArbitraryObject = ArbitraryObject> = (
  config: T
) => Promise<void>;

export type GetAuthorizationUri = (redirectUri: string, state: string) => Promise<string>;

export type AccessTokenObject = { accessToken: string } & Record<string, string>;

export type GetAccessToken = (code: string, redirectUri?: string) => Promise<AccessTokenObject>;

export type GetUserInfo = (
  accessTokenObject: AccessTokenObject
) => Promise<{ id: string } & Record<string, string | undefined>>;

export type GetConnectorConfig<T extends ArbitraryObject = ArbitraryObject> = (
  id: string
) => Promise<T>;

export type GetTimeout = () => Promise<number>;

export type GetTimestamp = () => string;
