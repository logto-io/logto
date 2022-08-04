import fs from 'fs/promises';
import path from 'path';

import {
  ConnectorError,
  ConnectorErrorCodes,
  SmsSendMessageByFunction,
  SmsConnectorInstance,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant';
import { mockSmsConfigGuard, MockSmsConfig } from './types';

export default class MockSmsConnector<T> extends SmsConnectorInstance<MockSmsConfig, T> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
    this.metadataParser();
  }

  public validateConfig(config: unknown): asserts config is MockSmsConfig {
    const result = mockSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public readonly sendMessageBy: SmsSendMessageByFunction<MockSmsConfig> = async (
    config,
    phone,
    type,
    data
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
