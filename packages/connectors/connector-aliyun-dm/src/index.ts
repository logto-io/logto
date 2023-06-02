import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

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
  parseJson,
  connectorDataParser,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { singleSendMail } from './single-send-mail.js';
import {
  aliyunDmConfigGuard,
  sendEmailResponseGuard,
  sendMailErrorResponseGuard,
  type SendMailErrorResponse,
  type AliyunDmConfig,
  type SendEmailResponse,
} from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<AliyunDmConfig>(config, aliyunDmConfigGuard);
    const { accessKeyId, accessKeySecret, accountName, fromAlias, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(ConnectorErrorCodes.TemplateNotFound, {
        data: templates,
        message: `Cannot find template for type: ${type}`,
      })
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

      const parsedBody = parseJson(httpResponse.body);
      return connectorDataParser<SendEmailResponse>(parsedBody, sendEmailResponseGuard);
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody },
        } = error;

        assert(
          typeof rawBody === 'string',
          new ConnectorError(ConnectorErrorCodes.InvalidResponse, {
            message: `Invalid response raw body type: ${typeof rawBody}`,
            data: rawBody,
          })
        );

        errorHandler(rawBody);
      }

      throw error;
    }
  };

const errorHandler = (errorResponseBody: string) => {
  const parsedBody = parseJson(errorResponseBody);
  const errorResponse = connectorDataParser<SendMailErrorResponse>(
    parsedBody,
    sendMailErrorResponseGuard
  );

  throw new ConnectorError(ConnectorErrorCodes.General, { data: errorResponse });
};

const createAliyunDmConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: aliyunDmConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createAliyunDmConnector;
