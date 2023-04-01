import { assert } from '@silverhand/essentials';
import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  SmsConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import type { MockSmsConfig } from './types.js';
import { mockSmsConfigGuard } from './types.js';

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
      path.join('/tmp', 'logto_mock_verification_code_record.txt'),
      JSON.stringify({ phone: to, code: payload.code, type }) + '\n'
    );

    return { phone: to, data: payload };
  };

const createMockSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: mockSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createMockSmsConnector;
