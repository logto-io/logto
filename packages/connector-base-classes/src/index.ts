import { existsSync, readFileSync } from 'fs';
import path from 'path';

import {
  ConnectorMetadata,
  GetConnectorConfig,
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

export class BaseConnector<T> {
  public metadata!: ConnectorMetadata;
  public getConfig: GetConnectorConfig;

  constructor(getConnectorConfig: GetConnectorConfig) {
    this.getConfig = getConnectorConfig;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public validateConfig(config: unknown): asserts config is T {}

  // eslint-disable-next-line complexity
  protected metadataParser = (currentPath: string) => {
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

export class SmsConnector<T> extends BaseConnector<T> {
  protected readonly sendMessageBy!: EmailSendMessageByFunction<T>;

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

export class EmailConnector<T> extends BaseConnector<T> {
  protected readonly sendMessageBy!: SmsSendMessageByFunction<T>;

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

export class SocialConnector<T> extends BaseConnector<T> {
  public getAuthorizationUri!: GetAuthorizationUri;

  public getUserInfo!: GetUserInfo;

  protected authResponseParser!: AuthResponseParser;
}
