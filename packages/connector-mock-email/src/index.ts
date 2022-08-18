import fs from 'fs/promises';
import path from 'path';

import {
  ConnectorError,
  ConnectorErrorCodes,
  EmailConnector,
  GetConnectorConfig,
  SendMessageByFunction,
  ValidateConfig,
} from '@logto/connector-schemas';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant';
import { mockMailConfigGuard, MockMailConfig } from './types';

export { defaultMetadata } from './constant';

export default class MockMailConnector extends EmailConnector<MockMailConfig> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
  }

  public validateConfig: ValidateConfig<MockMailConfig> = (config: unknown) => {
    const result = mockMailConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  protected readonly sendMessageBy: SendMessageByFunction<MockMailConfig> = async (
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
