import fs from 'fs/promises';
import path from 'path';

import {
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  EmailConnector,
  validateConfig,
} from '@logto/connector-core';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant';
import { mockMailConfigGuard, MockMailConfig } from './types';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<MockMailConfig>(config, mockMailConfigGuard);
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
      JSON.stringify({ address: to, code: payload.code, type }) + '\n'
    );

    return { address: to, data: payload };
  };

const createMockEmailConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    configGuard: mockMailConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createMockEmailConnector;
