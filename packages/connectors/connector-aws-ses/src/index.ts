import { assert, trySafe } from '@silverhand/essentials';

import type { SESv2Client, SendEmailCommand, SendEmailCommandOutput } from '@aws-sdk/client-sesv2';
import { SESv2ServiceException } from '@aws-sdk/client-sesv2';
import type {
  CreateConnector,
  EmailConnector,
  GetConnectorConfig,
  GetI18nEmailTemplate,
  SendMessageFunction,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  getConfigTemplateByType,
  validateConfig,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { awsSesConfigGuard } from './types.js';
import { makeClient, makeCommand, makeEmailContent } from './utils.js';

const sendMessage =
  (
    getConfig: GetConnectorConfig,
    getI18nEmailTemplate?: GetI18nEmailTemplate
  ): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, awsSesConfigGuard);
    const { accessKeyId, accessKeySecret, region } = config;

    const customTemplate = await trySafe(async () => getI18nEmailTemplate?.(type, payload.locale));

    // Fall back to the default template if the custom i18n template is not found.
    const template = customTemplate ?? getConfigTemplateByType(type, config);

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
      const response: SendEmailCommandOutput = await client.send(command);

      assert(
        response.$metadata.httpStatusCode === 200,
        new ConnectorError(ConnectorErrorCodes.InvalidResponse, response)
      );

      return response.MessageId;
    } catch (error: unknown) {
      if (error instanceof SESv2ServiceException) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, error.message);
      }

      throw error;
    }
  };

const createAwsSesConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
  getI18nEmailTemplate,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: awsSesConfigGuard,
    sendMessage: sendMessage(getConfig, getI18nEmailTemplate),
  };
};

export default createAwsSesConnector;
