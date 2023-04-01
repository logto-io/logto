import type { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { SESv2ServiceException } from '@aws-sdk/client-sesv2';
import type {
  CreateConnector,
  EmailConnector,
  GetConnectorConfig,
  SendMessageFunction,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  validateConfig,
} from '@logto/connector-kit';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant.js';
import type { AwsSesConfig } from './types.js';
import { awsSesConfigGuard } from './types.js';
import { makeClient, makeCommand, makeEmailContent } from './utils.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<AwsSesConfig>(config, awsSesConfigGuard);
    const { accessKeyId, accessKeySecret, region, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    const client: SESv2Client = makeClient(accessKeyId, accessKeySecret, region);
    const emailContent = makeEmailContent(template, payload);
    const command: SendEmailCommand = makeCommand(config, emailContent, to);

    try {
      const response = await client.send(command);

      if (response.$metadata.httpStatusCode !== 200) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, { response });
      }

      return response.MessageId;
    } catch (error: unknown) {
      if (error instanceof SESv2ServiceException) {
        const { message } = error;
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, message);
      }
      throw error;
    }
  };

const createAwsSesConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: awsSesConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createAwsSesConnector;
