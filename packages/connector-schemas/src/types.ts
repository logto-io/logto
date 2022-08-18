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

class BaseConnector<T> {
  public getConfig!: GetConnectorConfig;
  public metadata!: ConnectorMetadata;

  public sendMessage?: SendMessageFunction;
  public sendTestMessage?: SendMessageFunction;

  public getAuthorizationUri?: GetAuthorizationUri;
  public getUserInfo?: GetUserInfo;

  protected authResponseParser?: AuthResponseParser;

  constructor(getConnectorConfig: GetConnectorConfig) {
    this.getConfig = getConnectorConfig;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public validateConfig: ValidateConfig<T> = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected readonly sendMessageBy?: SendMessageFunction<T> = async () => {};
}

class PasswordlessConnector<T> extends BaseConnector<T> {
  protected readonly sendMessageBy!: SendMessageFunction<T>;

  public sendMessage: SendMessageFunction = async ({ to, type, payload }) => {
    const config = await this.getConfig(this.metadata.id);
    this.validateConfig(config);

    return this.sendMessageBy({ to, type, payload }, config);
  };

  public sendTestMessage?: SendMessageFunction = async ({ to, type, payload }, config) => {
    this.validateConfig(config);

    return this.sendMessageBy({ to, type, payload }, config);
  };
}

export class SmsConnector<T> extends PasswordlessConnector<T> {}

export class EmailConnector<T> extends PasswordlessConnector<T> {}

export class SocialConnector<T> extends BaseConnector<T> {
  public getAuthorizationUri!: GetAuthorizationUri;
  public getUserInfo!: GetUserInfo;

  protected authResponseParser?: AuthResponseParser;
}
