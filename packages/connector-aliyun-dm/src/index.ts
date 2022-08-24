import {
  ConnectorError,
  ConnectorErrorCodes,
  CreateConnector,
  EmailConnector,
  GetConnectorConfig,
  SendMessageFunction,
  validateConfig,
} from '@logto/connector-core';
import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import { defaultMetadata } from './constant';
import { singleSendMail } from './single-send-mail';
import {
  AliyunDmConfig,
  aliyunDmConfigGuard,
  sendEmailResponseGuard,
  sendMailErrorResponseGuard,
} from './types';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  // eslint-disable-next-line complexity
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<AliyunDmConfig>(config, aliyunDmConfigGuard);
    const { accessKeyId, accessKeySecret, accountName, fromAlias, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    try {
      const httpResponse = await singleSendMail(
        {
          AccessKeyId: accessKeyId,
          AccountName: accountName,
          ReplyToAddress: 'false',
          AddressType: '1',
          ToAddress: to,
          FromAlias: fromAlias,
          Subject: template.subject,
          HtmlBody:
            typeof payload.code === 'string'
              ? template.content.replace(/{{code}}/g, payload.code)
              : template.content,
        },
        accessKeySecret
      );

      const result = sendEmailResponseGuard.safeParse(JSON.parse(httpResponse.body));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
      }

      return result.data;
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody },
        } = error;

        assert(
          typeof rawBody === 'string',
          new ConnectorError(ConnectorErrorCodes.InvalidResponse)
        );

        errorHandler(rawBody);
      }

      throw error;
    }
  };

const errorHandler = (errorResponseBody: string) => {
  const result = sendMailErrorResponseGuard.safeParse(JSON.parse(errorResponseBody));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
  }

  const { Message: errorDescription, ...rest } = result.data;

  throw new ConnectorError(ConnectorErrorCodes.General, { errorDescription, ...rest });
};

const createAliyunDmConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    configGuard: aliyunDmConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createAliyunDmConnector;
