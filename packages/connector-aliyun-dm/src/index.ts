import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  EmailSendMessageFunction,
  EmailSendTestMessageFunction,
  EmailConnector,
  GetConnectorConfig,
  EmailMessageTypes,
} from '@logto/connector-types';
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

export default class AliyunDmConnector implements EmailConnector<AliyunDmConfig> {
  public metadata: ConnectorMetadata = defaultMetadata;
  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig(config: unknown): asserts config is AliyunDmConfig {
    const result = aliyunDmConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public sendMessage: EmailSendMessageFunction = async (address, type, data) => {
    const emailConfig = await this.getConfig(this.metadata.id);

    this.validateConfig(emailConfig);

    return this.sendMessageBy(address, type, data, emailConfig);
  };

  public sendTestMessage: EmailSendTestMessageFunction = async (config, address, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(address, type, data, config);
  };

  private readonly sendMessageBy = async (
    address: string,
    type: keyof EmailMessageTypes,
    data: EmailMessageTypes[typeof type],
    config: AliyunDmConfig
  ) => {
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
          ToAddress: address,
          FromAlias: fromAlias,
          Subject: template.subject,
          HtmlBody:
            typeof data.code === 'string'
              ? template.content.replace(/{{code}}/g, data.code)
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

        this.errorHandler(rawBody);
      }

      throw error;
    }
  };

  private readonly errorHandler = (errorResponseBody: string) => {
    const result = sendMailErrorResponseGuard.safeParse(JSON.parse(errorResponseBody));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
    }

    const { Message: errorDescription, ...rest } = result.data;

    throw new ConnectorError(ConnectorErrorCodes.General, { errorDescription, ...rest });
  };
}
