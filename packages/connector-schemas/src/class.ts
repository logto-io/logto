import { ConnectorMetadata } from './types';

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
  payload: EmailMessageTypes[typeof type]
) => Promise<T>;

export type EmailSendTestMessageFunction<T = unknown> = (
  config: Record<string, unknown>,
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<T>;

export type EmailSendMessageByFunction<T> = (
  config: T,
  address: string,
  type: keyof EmailMessageTypes,
  payload: EmailMessageTypes[typeof type]
) => Promise<unknown>;

export type SmsSendMessageFunction<T = unknown> = (
  phone: string,
  type: keyof SmsMessageTypes,
  payload: SmsMessageTypes[typeof type]
) => Promise<T>;

export type SmsSendTestMessageFunction<T = unknown> = (
  config: Record<string, unknown>,
  phone: string,
  type: keyof SmsMessageTypes,
  payload: SmsMessageTypes[typeof type]
) => Promise<T>;

export type SmsSendMessageByFunction<T> = (
  config: T,
  phone: string,
  type: keyof SmsMessageTypes,
  payload: SmsMessageTypes[typeof type]
) => Promise<unknown>;

export type ValidateConfig<T> = (config: unknown) => asserts config is T;

export type GetAuthorizationUri = (payload: {
  state: string;
  redirectUri: string;
}) => Promise<string>;

export type GetUserInfo = (
  data: unknown
) => Promise<{ id: string } & Record<string, string | undefined>>;

export type GetConnectorConfig = (id: string) => Promise<unknown>;

export type AuthResponseParser<T = Record<string, unknown>> = (response: unknown) => Promise<T>;

abstract class BaseConnector<T> {
  public getConfig: GetConnectorConfig;
  public metadata!: ConnectorMetadata;

  constructor(getConnectorConfig: GetConnectorConfig) {
    this.getConfig = getConnectorConfig;
  }

  public abstract validateConfig(config: unknown): asserts config is T;
}

export abstract class SmsConnector<T> extends BaseConnector<T> {
  protected abstract readonly sendMessageBy: EmailSendMessageByFunction<T>;

  public sendMessage: EmailSendMessageFunction = async (address, type, data) => {
    const config = await this.getConfig(this.metadata.id);
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };

  public sendTestMessage?: EmailSendTestMessageFunction = async (config, address, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };
}

export abstract class EmailConnector<T> extends BaseConnector<T> {
  protected abstract readonly sendMessageBy: SmsSendMessageByFunction<T>;

  public sendMessage: SmsSendMessageFunction = async (address, type, data) => {
    const config = await this.getConfig(this.metadata.id);
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };

  public sendTestMessage?: SmsSendTestMessageFunction = async (config, address, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };
}

export abstract class SocialConnector<T> extends BaseConnector<T> {
  public abstract getAuthorizationUri: GetAuthorizationUri;

  public abstract getUserInfo: GetUserInfo;

  protected authResponseParser?: AuthResponseParser;
}
