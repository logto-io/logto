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

  public sendMessage: SmsSendMessageFunction = async (phone, type, { code }, config) => {
    const smsConfig =
      (config as AliyunSmsConfig | undefined) ?? (await this.getConfig(this.metadata.id));
    await this.validateConfig(smsConfig);
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

      /**
       * You may wonder why the errorHandler is called twice here. We found that the SendSms API of
       * the Aliyun SMS service may throw an error directly after receiving the request, or it may
       * need developers to determine whether the request succeeded by `Code` getting from the response.
       */
      this.errorHandler(rawBody, Code);

      return httpResponse;
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

  private readonly errorHandler = (message: string, code?: string) => {
    if (!code) {
      const result = sendSmsResponseGuard.safeParse(JSON.parse(message));

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
      }

      const { Code } = result.data;

      assert(
        !Code.includes('InvalidAccessKeyId'),
        new ConnectorError(ConnectorErrorCodes.InvalidConfig, message)
      );
      assert(
        Code !== 'SignatureDoesNotMatch' && Code !== 'IncompleteSignature',
        new ConnectorError(ConnectorErrorCodes.InvalidConfig, message)
      );

      throw new ConnectorError(ConnectorErrorCodes.General, message);
    }

    // See https://help.aliyun.com/document_detail/101346.htm?spm=a2c4g.11186623.0.0.29d710f5TUxolJ
    assert(
      !(code === 'isv.ACCOUNT_NOT_EXISTS' || code === 'isv.SMS_TEMPLATE_ILLEGAL'),
      new ConnectorError(ConnectorErrorCodes.InvalidConfig, message)
    );
    assert(code === 'OK', new ConnectorError(ConnectorErrorCodes.General, message));
  };
}
