import fs from 'fs/promises';
import path from 'path';

import {
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  SendMessageFunction,
  validateConfig,
  CreateConnector,
  SmsConnector,
} from '@logto/connector-core';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant';
import { mockSmsConfigGuard, MockSmsConfig } from './types';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<MockSmsConfig>(config, mockSmsConfigGuard);
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
      JSON.stringify({ phone: to, code: payload.code, type }) + '\n'
    );

    return { phone: to, data: payload };
  };

const createMockSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    configGuard: mockSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createMockSmsConnector;
