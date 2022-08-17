import { Optional } from '@silverhand/essentials';

import { ConnectorMetadata } from './types';

// We will have message type 'ForgotPassword' available in the near future.
type MessageTypes = 'SignIn' | 'Register' | 'Test';

type SendMessageFunction = (
  to: string,
  type: MessageTypes,
  payload: { code: string }
) => Promise<unknown>;

type SendMessageByFunction<T = Record<string, unknown>> = (
  config: T,
  to: string,
  type: MessageTypes,
  payload: { code: string }
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

abstract class BaseConnector<T> {
  public getConfig: GetConnectorConfig;
  public metadata!: ConnectorMetadata;
  public abstract validateConfig: ValidateConfig<T>;

  constructor(getConnectorConfig: GetConnectorConfig) {
    this.getConfig = getConnectorConfig;
  }
}

abstract class PasswordlessConnector<T> extends BaseConnector<T> {
  protected abstract readonly sendMessageBy: SendMessageByFunction<T>;

  public sendMessage: SendMessageFunction = async (address, type, data) => {
    const config = await this.getConfig(this.metadata.id);
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };

  public sendTestMessage?: SendMessageByFunction = async (config, address, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };
}

export abstract class SmsConnector<T> extends PasswordlessConnector<T> {}

export abstract class EmailConnector<T> extends PasswordlessConnector<T> {}

export abstract class SocialConnector<T> extends BaseConnector<T> {
  public abstract getAuthorizationUri: GetAuthorizationUri;
  public abstract getUserInfo: GetUserInfo;

  protected abstract authResponseParser?: AuthResponseParser;
}
