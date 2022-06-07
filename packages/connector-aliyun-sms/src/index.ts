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
    const { Code } = sendSmsResponseGuard.parse(JSON.parse(rawBody));

    assert(Code === 'OK', new ConnectorError(ConnectorErrorCodes.General, rawBody));

    return httpResponse;
  };
}
