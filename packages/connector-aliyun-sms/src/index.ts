import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  SmsSendMessageFunction,
  ValidateConfig,
  SmsConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';

import { defaultMetadata } from './constant';
import { sendSms } from './single-send-text';
import { aliyunSmsConfigGuard, AliyunSmsConfig, sendSmsResponseGuard } from './types';

export default class AliyunSmsConnector implements SmsConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<AliyunSmsConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = aliyunSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public sendMessage: SmsSendMessageFunction = async (phone, type, { code }) => {
    const config = await this.getConfig(this.metadata.id);
    await this.validateConfig(config);
    const { accessKeyId, accessKeySecret, signName, templates } = config;
    const template = templates.find(({ usageType }) => usageType === type);

    assert(
      template,
      new ConnectorError(ConnectorErrorCodes.TemplateNotFound, `Cannot find template!`)
    );

    const httpResponse = await sendSms(
      {
        AccessKeyId: accessKeyId,
        PhoneNumbers: phone,
        SignName: signName,
        TemplateCode: template.code,
        TemplateParam: JSON.stringify({ code }),
      },
      accessKeySecret
    );

    const { body: rawBody } = httpResponse;
    const result = sendSmsResponseGuard.safeParse(JSON.parse(rawBody));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
    }

    const { Code } = result.data;

    this.errorHandler(Code, rawBody);

    return httpResponse;
  };

  private readonly errorHandler = (code: string, message: string) => {
    // See https://help.aliyun.com/document_detail/101346.htm?spm=a2c4g.11186623.0.0.29d710f5TUxolJ
    assert(
      !(code === 'isv.ACCOUNT_NOT_EXISTS' || code === 'isv.SMS_TEMPLATE_ILLEGAL'),
      new ConnectorError(ConnectorErrorCodes.InvalidConfig, message)
    );
    assert(code === 'OK', new ConnectorError(ConnectorErrorCodes.General, message));
  };
}
