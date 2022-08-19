import fs from 'fs/promises';
import path from 'path';

import {
  ConnectorError,
  ConnectorErrorCodes,
  SendMessageFunction,
  LogtoConnector,
  GetConnectorConfig,
  ValidateConfig,
} from '@logto/connector-schemas';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant';
import { mockSmsConfigGuard, MockSmsConfig } from './types';

export { defaultMetadata } from './constant';

export default class MockLogtoConnector extends LogtoConnector<MockSmsConfig> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
  }

  public validateConfig: ValidateConfig<MockSmsConfig> = (config: unknown) => {
    const result = mockSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  public sendMessage: SendMessageFunction = async ({ to, type, payload }, inputConfig) => {
    const config = inputConfig ?? (await this.getConfig(this.metadata.id));
    assert(config, new ConnectorError(ConnectorErrorCodes.InvalidConfig));

    this.validateConfig(config);

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
      JSON.stringify({ to, code: payload.code, type }) + '\n'
    );

    return { to, payload };
  };
}
