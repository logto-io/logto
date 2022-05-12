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
import { Response } from 'got';

import { defaultMetadata } from './constant';
import { sendSms } from './single-send-text';
import { aliyunSmsConfigGuard, AliyunSmsConfig, SendSmsResponse } from './types';

export class AliyunSmsConnector implements SmsConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  public readonly getConfig: GetConnectorConfig<AliyunSmsConfig>;

  constructor(getConnectorConfig: GetConnectorConfig<AliyunSmsConfig>) {
    this.getConfig = getConnectorConfig;
  }

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = aliyunSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public sendMessage: SmsSendMessageFunction<Response<SendSmsResponse>> = async (
    phone,
    type,
    { code }
  ) => {
    const config = await this.getConfig(this.metadata.target, this.metadata.platform);
    await this.validateConfig(config);
    const { accessKeyId, accessKeySecret, signName, templates } = config;
    const template = templates.find(({ usageType }) => usageType === type);

    assert(
      template,
      new ConnectorError(ConnectorErrorCodes.TemplateNotFound, `Cannot find template!`)
    );

    return sendSms(
      {
        AccessKeyId: accessKeyId,
        PhoneNumbers: phone,
        SignName: signName,
        TemplateCode: template.code,
        TemplateParam: JSON.stringify({ code }),
      },
      accessKeySecret
    );
  };
}
