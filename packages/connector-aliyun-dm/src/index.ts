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
import { Response } from 'got';

import { defaultMetadata } from './constant';
import { singleSendMail } from './single-send-mail';
import { SendEmailResponse, AliyunDmConfig, aliyunDmConfigGuard } from './types';

export class AliyunDmConnector implements EmailConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<AliyunDmConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = aliyunDmConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public sendMessage: EmailSendMessageFunction<Response<SendEmailResponse>> = async (
    address,
    type,
    data
  ) => {
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

    return singleSendMail(
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
  };
}
