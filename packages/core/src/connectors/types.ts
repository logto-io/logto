import { Languages } from '@logto/phrases';
import { ConnectorConfig, Connector } from '@logto/schemas';

export enum ConnectorType {
  SMS = 'SMS',
  Email = 'Email',
  Social = 'Social',
}
export interface ConnectorMetadata {
  id: string;
  type: ConnectorType;
  name: Record<Languages, string>;
  logo: string;
  description: Record<Languages, string>;
}

// The name `Connector` is used for database, use `ConnectorInstance` to avoid confusing.
export type ConnectorInstance = SmsConnector | EmailConector | SocialConector;

export interface BaseConnector {
  connector?: Connector;
  metadata: ConnectorMetadata;
  validateConfig: ValidateConfig;
}

export interface SmsConnector extends BaseConnector {
  sendMessage: SmsSendMessageFunction;
}

export interface EmailConector extends BaseConnector {
  sendMessage: EmailSendMessageFunction;
}

export interface SocialConector extends BaseConnector {
  getAuthorizationUri: GetAuthorizationUri;
  getAccessToken: GetAccessToken;
  getUserInfo: GetUserInfo;
}

interface MessageTypes {
  SignIn: {
    code: string;
  };
  Register: {
    code: string;
  };
  ForgotPassword: {
    code: string;
  };
}

type SmsMessageTypes = EmailMessageTypes;

export interface TextMessageTypes extends MessageTypes {}

export type EmailSendMessageFunction<T = unknown> = (
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<T>;

export type TextSendMessageFunction<T = unknown, K = Record<string, unknown> & { code: string }> = (
  phone: string,
  signName: string,
  templateCode: string,
  payload: K
) => Promise<T>;

export class ConnectorError extends Error {}

export class ConnectorConfigError extends ConnectorError {}

export type ValidateConfig<T extends ConnectorConfig = ConnectorConfig> = (
  config: T
) => Promise<void>;

export type GetAuthorizationUri = (redirectUri: string, state: string) => Promise<string>;

export type GetAccessToken = (code: string) => Promise<string>;

export type GetUserInfo = (accessToken: string) => Promise<SocialUserInfo>;

export interface SocialUserInfo {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
}
