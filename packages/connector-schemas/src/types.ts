import type { Language } from '@logto/phrases';
import { Nullable, Optional } from '@silverhand/essentials';

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

export type ConnectorMetadata = {
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
};

type MessageTypes = 'SignIn' | 'Register' | 'ForgotPassword' | 'Test';

export type SendMessageFunction<T = Record<string, unknown>> = (
  data: { to: string; type: MessageTypes; payload: { code: string } },
  config?: T
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

  public getAuthorizationUri?: GetAuthorizationUri;
  public getUserInfo?: GetUserInfo;

  public sendMessage?: SendMessageFunction;
  public sendTestMessage?: SendMessageFunction;

  protected authResponseParser?: AuthResponseParser;
  protected readonly sendMessageBy?: SendMessageFunction<T>;

  constructor(getConnectorConfig: GetConnectorConfig) {
    this.getConfig = getConnectorConfig;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public validateConfig: ValidateConfig<T> = async () => {};
}
