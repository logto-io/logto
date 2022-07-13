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
import { HTTPError } from 'got';
import { ZodError } from 'zod';

import { defaultMetadata } from './constant';
import { sendSms } from './single-send-text';
import { aliyunSmsConfigGuard, AliyunSmsConfig, sendSmsResponseGuard } from './types';

export default class AliyunSmsConnector implements SmsConnector {
  public metadata: ConnectorMetadata = defaultMetadata;
  private _configZodError: ZodError = new ZodError([]);

  private get configZodError() {
    return this._configZodError;
  }

  private set configZodError(zodError: ZodError) {
    this._configZodError = zodError;
  }

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig: ValidateConfig<AliyunSmsConfig> = (
    config: unknown
  ): config is AliyunSmsConfig => {
    const result = aliyunSmsConfigGuard.safeParse(config);

    if (!result.success) {
      this.configZodError = result.error;
    }

    return result.success;
  };

  // eslint-disable-next-line complexity
  public sendMessage: SmsSendMessageFunction = async (phone, type, { code }, config) => {
    const smsConfig = config ?? (await this.getConfig(this.metadata.id));

    if (!this.validateConfig(smsConfig)) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, this.configZodError);
    }

    const { accessKeyId, accessKeySecret, signName, templates } = smsConfig;
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
          TemplateParam: JSON.stringify({ code }),
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
