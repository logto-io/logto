import type { LanguageKey } from '@logto/shared';
import { Nullable } from '@silverhand/essentials';
import { z, ZodType } from 'zod';

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

type I18nPhrases = { en: string } & {
  [K in Exclude<LanguageKey, 'en'>]?: string;
};

export type ConnectorMetadata = {
  id: string;
  target: string;
  type: ConnectorType;
  platform: Nullable<ConnectorPlatform>;
  name: I18nPhrases;
  logo: string;
  logoDark: Nullable<string>;
  description: I18nPhrases;
  readme: string;
  configTemplate: string;
};

export enum ConnectorErrorCodes {
  General = 'General',
  InvalidMetadata = 'InvalidMetadata',
  InvalidConfigGuard = 'InvalidConfigGuard',
  InsufficientRequestParameters = 'InsufficientRequestParameters',
  InvalidConfig = 'InvalidConfig',
  InvalidResponse = 'InvalidResponse',
  TemplateNotFound = 'TemplateNotFound',
  NotImplemented = 'NotImplemented',
  SocialAuthCodeInvalid = 'SocialAuthCodeInvalid',
  SocialAccessTokenInvalid = 'SocialAccessTokenInvalid',
  SocialIdTokenInvalid = 'SocialIdTokenInvalid',
  AuthorizationFailed = 'AuthorizationFailed',
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

export type BaseConnector = {
  metadata: ConnectorMetadata;
  configGuard: ZodType;
};

export type SmsConnector = {
  sendMessage: SendMessageFunction;
} & BaseConnector;

export type EmailConnector = SmsConnector;

export type SocialConnector = {
  getAuthorizationUri: GetAuthorizationUri;
  getUserInfo: GetUserInfo;
} & BaseConnector;

export type GeneralConnector = BaseConnector &
  Partial<SocialConnector & EmailConnector & SmsConnector>;

export type CreateConnector<
  T extends SocialConnector | EmailConnector | SmsConnector | GeneralConnector
> = (options: { getConfig: GetConnectorConfig }) => Promise<T>;

export type SendMessageFunction = (
  data: { to: string; type: MessageTypes; payload: { code: string } },
  config?: unknown
) => Promise<unknown>;

export type GetAuthorizationUri = (payload: {
  state: string;
  redirectUri: string;
}) => Promise<string>;

export type GetUserInfo = (
  data: unknown
) => Promise<{ id: string } & Record<string, string | undefined>>;

export type GetConnectorConfig = (id: string) => Promise<unknown>;
