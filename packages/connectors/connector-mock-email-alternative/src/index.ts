import { assert } from '@silverhand/essentials';
import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  EmailConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  mockConnectorFilePaths,
  getConfigTemplateByType,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { mockMailConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, mockMailConfigGuard);

    const template = getConfigTemplateByType(type, config);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    const filePath = mockConnectorFilePaths.Email;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(
      filePath,
      JSON.stringify({ address: to, code: payload.code, type, payload }) + '\n'
    );

    return { address: to, data: payload };
  };

const createAlternativeMockEmailConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: mockMailConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createAlternativeMockEmailConnector;
