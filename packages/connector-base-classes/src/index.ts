import { existsSync, readFileSync } from 'fs';
import path from 'path';

import {
  ConnectorMetadata,
  GetConnectorConfig,
  ConnectorError,
  ConnectorErrorCodes,
  EmailSendMessageFunction,
  EmailSendTestMessageFunction,
  EmailSendMessageByFunction,
  SmsSendMessageFunction,
  SmsSendTestMessageFunction,
  SmsSendMessageByFunction,
  GetAuthorizationUri,
  GetUserInfo,
  AuthResponseParser,
} from '@logto/connector-types';

export class BaseConnectorInstance<T, U> {
  public metadata!: ConnectorMetadata;
  public getConfig: GetConnectorConfig;

  private _connector?: U;

  public get connector() {
    if (!this._connector) {
      throw new ConnectorError(ConnectorErrorCodes.General);
    }

    return this._connector;
  }

  public set connector(input: U) {
    this._connector = input;
  }

  constructor(getConnectorConfig: GetConnectorConfig) {
    this.getConfig = getConnectorConfig;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public validateConfig(config: unknown): asserts config is T {}

  // eslint-disable-next-line complexity
  public metadataParser = () => {
    // eslint-disable-next-line unicorn/prefer-module
    const currentPath = __dirname;

    if (
      !this.metadata.logo.startsWith('http') &&
      existsSync(path.join(currentPath, '..', this.metadata.logo))
    ) {
      const data = readFileSync(path.join(currentPath, '..', this.metadata.logo));
      this.metadata.logo = `data:image/svg+xml;base64,${data.toString('base64')}`;
    }

    if (
      this.metadata.logoDark &&
      !this.metadata.logoDark.startsWith('http') &&
      existsSync(path.join(currentPath, '..', this.metadata.logoDark))
    ) {
      const data = readFileSync(path.join(currentPath, '..', this.metadata.logoDark));
      this.metadata.logoDark = `data:image/svg+xml;base64,${data.toString('base64')}`;
    }

    if (this.metadata.readme && existsSync(path.join(currentPath, '..', this.metadata.readme))) {
      this.metadata.readme = readFileSync(
        path.join(currentPath, '..', this.metadata.readme),
        'utf8'
      );
    }

    if (
      this.metadata.configTemplate &&
      existsSync(path.join(currentPath, '..', this.metadata.configTemplate))
    ) {
      this.metadata.configTemplate = readFileSync(
        path.join(currentPath, '..', this.metadata.configTemplate),
        'utf8'
      );
    }
  };
}

export class SmsConnectorInstance<T, U> extends BaseConnectorInstance<T, U> {
  public readonly sendMessageBy!: EmailSendMessageByFunction<T>;

  public sendMessage: EmailSendMessageFunction = async (address, type, data) => {
    const config = await this.getConfig(this.metadata.id);
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };

  public sendTestMessage: EmailSendTestMessageFunction = async (config, address, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };
}

export class EmailConnectorInstance<T, U> extends BaseConnectorInstance<T, U> {
  public readonly sendMessageBy!: SmsSendMessageByFunction<T>;

  public sendMessage: SmsSendMessageFunction = async (address, type, data) => {
    const config = await this.getConfig(this.metadata.id);
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };

  public sendTestMessage: SmsSendTestMessageFunction = async (config, address, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };
}

export class SocialConnectorInstance<T, U> extends BaseConnectorInstance<T, U> {
  public getAuthorizationUri!: GetAuthorizationUri;

  public getUserInfo!: GetUserInfo;

  protected authResponseParser!: AuthResponseParser;
}

export type ConnectorInstance =
  | InstanceType<typeof SmsConnectorInstance>
  | InstanceType<typeof EmailConnectorInstance>
  | InstanceType<typeof SocialConnectorInstance>;
