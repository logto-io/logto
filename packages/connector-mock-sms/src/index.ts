import fs from 'fs/promises';
import path from 'path';

import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  Connector,
  SmsSendMessageFunction,
  SmsSendTestMessageFunction,
  SmsConnectorInstance,
  GetConnectorConfig,
  SmsMessageTypes,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant';
import { mockSmsConfigGuard, MockSmsConfig } from './types';

export default class MockSmsConnector implements SmsConnectorInstance<MockSmsConfig> {
  public metadata: ConnectorMetadata = defaultMetadata;
  private _connector?: Connector;

  public get connector() {
    if (!this._connector) {
      throw new ConnectorError(ConnectorErrorCodes.General);
    }

    return this._connector;
  }

  public set connector(input: Connector) {
    this._connector = input;
  }

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig(config: unknown): asserts config is MockSmsConfig {
    const result = mockSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public sendMessage: SmsSendMessageFunction = async (phone, type, data) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    return this.sendMessageBy(config, phone, type, data);
  };

  public sendTestMessage: SmsSendTestMessageFunction = async (config, phone, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(config, phone, type, data);
  };

  private readonly sendMessageBy = async (
    config: MockSmsConfig,
    phone: string,
    type: keyof SmsMessageTypes,
    data: SmsMessageTypes[typeof type]
  ) => {
    const { templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    await fs.writeFile(
      path.join('/tmp', 'logto_mock_passcode_record.txt'),
      JSON.stringify({ phone, code: data.code, type }) + '\n'
    );

    return { phone, data };
  };
}
