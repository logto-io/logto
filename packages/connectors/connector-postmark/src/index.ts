import { assert } from '@silverhand/essentials';

import type {
  GetConnectorConfig,
  CreateConnector,
  EmailConnector,
  SendMessageFunction,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
} from '@logto/connector-kit';
import { ServerClient } from 'postmark';

import { defaultMetadata } from './constant.js';
import { postmarkConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;

    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, postmarkConfigGuard);

    const { serverToken, fromEmail, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    const client = new ServerClient(serverToken);

    try {
      await client.sendEmailWithTemplate({
        From: fromEmail,
        TemplateAlias: template.templateAlias,
        To: to,
        TemplateModel: payload,
      });
    } catch (error: unknown) {
      throw new ConnectorError(
        ConnectorErrorCodes.General,
        error instanceof Error ? error.message : ''
      );
    }
  };

const createPostmarkConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: postmarkConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createPostmarkConnector;
