import type { Language } from '@logto/phrases';
import { Nullable, Optional } from '@silverhand/essentials';

import { ConnectorError, ConnectorErrorCodes } from './error';

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

type I18nPhrases = { [Language.English]: string } & {
  [key in Exclude<Language, Language.English>]?: string;
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

export enum MessageTypes {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
  Test = 'Test',
}

export type SendMessageFunction = (
  data: { to: string; type: MessageTypes; payload: { code: string } },
  config?: unknown
) => Promise<unknown>;

export type ValidateConfig<T> = (config: unknown) => asserts config is T;

export type GetAuthorizationUri = (payload: {
  state: string;
  redirectUri: string;
}) => Promise<string>;

export type GetUserInfo = (
  data: unknown
) => Promise<{ id: string } & Record<string, Optional<string>>>;

export type GetConnectorConfig = (id: string) => Promise<unknown>;

export type AuthResponseParser<T = Record<string, unknown>> = (response: unknown) => Promise<T>;

export class LogtoConnector<T> {
  public getConfig!: GetConnectorConfig;
  public metadata!: ConnectorMetadata;

  constructor(getConnectorConfig: GetConnectorConfig) {
    this.getConfig = getConnectorConfig;
  }

  public validateConfig: ValidateConfig<T> = () => {
    throw new ConnectorError(ConnectorErrorCodes.NotImplemented);
  };
}
