import { assert, trySafe } from '@silverhand/essentials';
import fs from 'node:fs/promises';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  EmailConnector,
  GetI18nEmailTemplate,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  mockConnectorFilePaths,
  replaceSendMessageHandlebars,
  getConfigTemplateByType,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { mockMailConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig, getI18nTemplate?: GetI18nEmailTemplate): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, mockMailConfigGuard);

    const customTemplate = await trySafe(async () => getI18nTemplate?.(type, payload.locale));
    // Fall back to the default template if the custom template is not found.
    const template = customTemplate ?? getConfigTemplateByType(type, config);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    await fs.writeFile(
      mockConnectorFilePaths.Email,
      JSON.stringify({
        address: to,
        code: payload.code,
        type,
        payload,
        template,
        subject: replaceSendMessageHandlebars(template.subject, payload),
        content: replaceSendMessageHandlebars(template.content, payload),
      }) + '\n'
    );

    return { address: to, data: payload };
  };

const createMockEmailConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
  getI18nEmailTemplate,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: mockMailConfigGuard,
    sendMessage: sendMessage(getConfig, getI18nEmailTemplate),
  };
};

export default createMockEmailConnector;
