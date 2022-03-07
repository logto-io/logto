import { ArbitraryObject, Connector, PasscodeType, ConnectorMetadata } from '@logto/schemas';
import { z } from 'zod';

export { ConnectorType } from '@logto/schemas';
export type { ConnectorMetadata } from '@logto/schemas';

// The name `Connector` is used for database, use `ConnectorInstance` to avoid confusing.
export type IConnector = SmsConnector | EmailConnector | SocialConnector;
export type ConnectorInstance =
  | SmsConnectorInstance
  | EmailConnectorInstance
  | SocialConnectorInstance;

export interface BaseConnector {
  metadata: ConnectorMetadata;
  validateConfig: ValidateConfig;
}

export interface SmsConnector extends BaseConnector {
  sendMessage: SmsSendMessageFunction;
}

export type SmsConnectorInstance = SmsConnector & { connector: Connector };

export interface EmailConnector extends BaseConnector {
  sendMessage: EmailSendMessageFunction;
}

export type EmailConnectorInstance = EmailConnector & { connector: Connector };

export interface SocialConnector extends BaseConnector {
  getAuthorizationUri: GetAuthorizationUri;
  getAccessToken: GetAccessToken;
  getUserInfo: GetUserInfo;
}

export type SocialConnectorInstance = SocialConnector & { connector: Connector };

type EmailMessageTypes = {
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

export type TemplateType = PasscodeType | 'Test';

export enum ConnectorErrorCodes {
  General,
  InvalidConfig,
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

export type ValidateConfig<T extends ArbitraryObject = ArbitraryObject> = (
  config: T
) => Promise<void>;

export type GetAuthorizationUri = (redirectUri: string, state: string) => Promise<string>;

export type GetAccessToken = (code: string, redirectUri: string) => Promise<string>;

export type GetUserInfo = (accessToken: string) => Promise<SocialUserInfo>;

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;
