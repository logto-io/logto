import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  SmsMessageTypes,
  SmsSendMessageFunction,
  ValidateConfig,
  SmsConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import { defaultMetadata } from './constant';
import { sendSms } from './single-send-text';
import { aliyunSmsConfigGuard, AliyunSmsConfig, sendSmsResponseGuard } from './types';

export default class AliyunSmsConnector implements SmsConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<AliyunSmsConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = aliyunSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  public sendMessage: SmsSendMessageFunction = async (phone, type, { code }) => {
    const smsConfig = await this.getConfig(this.metadata.id);
    await this.validateConfig(smsConfig);

    return this.sendMessageBy(smsConfig, phone, type, { code });
  };

  public sendTestMessage: SmsSendMessageFunction = async (phone, type, { code }, config) => {
    if (!config) {
      throw new ConnectorError(ConnectorErrorCodes.InsufficientRequestParameters);
    }

    await this.validateConfig(config);

    return this.sendMessageBy(config as AliyunSmsConfig, phone, type, { code });
  };

  private readonly sendMessageBy = async (
    config: AliyunSmsConfig,
    phone: string,
    type: keyof SmsMessageTypes,
    data: SmsMessageTypes[typeof type]
  ) => {
    const { accessKeyId, accessKeySecret, signName, templates } = config;
    const template = templates.find(({ usageType }) => usageType === type);

    assert(
      template,
      new ConnectorError(ConnectorErrorCodes.TemplateNotFound, `Cannot find template!`)
    );

    try {
      const httpResponse = await sendSms(
        {
          AccessKeyId: accessKeyId,
          PhoneNumbers: phone,
          SignName: signName,
          TemplateCode: template.templateCode,
          TemplateParam: JSON.stringify(data),
        },
        accessKeySecret
      );

      const { body: rawBody } = httpResponse;

      const { Code, Message, ...rest } = this.parseResponseString(rawBody);

      if (Code !== 'OK') {
        throw new ConnectorError(ConnectorErrorCodes.General, {
          errorDescription: Message,
          Code,
          ...rest,
        });
      }

      return httpResponse;
    } catch (error: unknown) {
      if (!(error instanceof HTTPError)) {
        throw error;
      }

      const {
        response: { body: rawBody },
      } = error;

      assert(typeof rawBody === 'string', new ConnectorError(ConnectorErrorCodes.InvalidResponse));

      const { Code, Message, ...rest } = this.parseResponseString(rawBody);

      throw new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription: Message,
        Code,
        ...rest,
      });
    }
  };

  private readonly parseResponseString = (response: string) => {
    const result = sendSmsResponseGuard.safeParse(JSON.parse(response));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
    }

    return result.data;
  };
}
