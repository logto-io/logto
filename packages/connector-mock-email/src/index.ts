import fs from 'fs/promises';
import path from 'path';

import { EmailConnectorInstance } from '@logto/connector-base-classes';
import {
  ConnectorError,
  ConnectorErrorCodes,
  EmailSendMessageByFunction,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant';
import { mockMailConfigGuard, MockMailConfig } from './types';

export default class MockMailConnector<T> extends EmailConnectorInstance<MockMailConfig, T> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
    this.metadataParser();
  }

  public validateConfig(config: unknown): asserts config is MockMailConfig {
    const result = mockMailConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public readonly sendMessageBy: EmailSendMessageByFunction<MockMailConfig> = async (
    config,
    address,
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
      JSON.stringify({ address, code: data.code, type }) + '\n'
    );

    return { address, data };
  };
}
