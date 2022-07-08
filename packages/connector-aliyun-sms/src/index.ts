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
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  /* eslint-disable complexity */
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
          TemplateCode: template.templateCode,
          TemplateParam: JSON.stringify({ code }),
        },
        accessKeySecret
      );

      const { body: rawBody } = httpResponse;

      const { Code } = this.parseResponseString(rawBody);

      if (Code === 'isv.ACCOUNT_NOT_EXISTS' || Code === 'isv.SMS_TEMPLATE_ILLEGAL') {
        throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, rawBody);
      }

      if (Code !== 'OK') {
        throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
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

      const { Code } = this.parseResponseString(rawBody);

      if (Code.includes('InvalidAccessKeyId')) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, rawBody);
      }

      if (Code === 'SignatureDoesNotMatch' || Code === 'IncompleteSignature') {
        throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, rawBody);
      }

      throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
    }
  };
  /* eslint-enable complexity */

  private readonly parseResponseString = (response: string) => {
    const result = sendSmsResponseGuard.safeParse(JSON.parse(response));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
    }

    return result.data;
  };
}
