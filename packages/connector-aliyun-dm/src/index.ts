import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  EmailSendMessageFunction,
  ValidateConfig,
  EmailConnector,
  GetConnectorConfig,
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

export default class AliyunDmConnector implements EmailConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<AliyunDmConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = aliyunDmConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public sendMessage: EmailSendMessageFunction = async (address, type, data) => {
    const config = await this.getConfig(this.metadata.id);
    await this.validateConfig(config);
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
        throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
      }

      throw error;
    }
  };

  private readonly errorHandler = (errorResponseBody: string) => {
    const result = sendMailErrorResponseGuard.safeParse(JSON.parse(errorResponseBody));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
    }

    const { Code } = result.data;

    // See https://help.aliyun.com/document_detail/29444.html.
    assert(
      !(
        Code === 'InvalidBody' ||
        Code === 'InvalidTemplate.NotFound' ||
        Code === 'InvalidSubject.Malformed' ||
        Code === 'InvalidFromAlias.Malformed'
      ),
      new ConnectorError(ConnectorErrorCodes.InvalidConfig, errorResponseBody)
    );
  };
}
