import {
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  SendMessageFunction,
  SmsConnector,
  CreateConnector,
  validateConfig,
  ConnectorType,
  jsonSafeParse,
} from '@logto/connector-core';
import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import { defaultMetadata } from './constant';
import { sendSms } from './single-send-text';
import { aliyunSmsConfigGuard, AliyunSmsConfig, sendSmsResponseGuard } from './types';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<AliyunSmsConfig>(config, aliyunSmsConfigGuard);
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
          PhoneNumbers: to,
          SignName: signName,
          TemplateCode: template.templateCode,
          TemplateParam: JSON.stringify(payload),
        },
        accessKeySecret
      );

      const { body: rawBody } = httpResponse;

      const { Code, Message, ...rest } = parseResponseString(rawBody);

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

      const { Code, Message, ...rest } = parseResponseString(rawBody);

      throw new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription: Message,
        Code,
        ...rest,
      });
    }
  };

const parseResponseString = (response: string) => {
  const result = sendSmsResponseGuard.safeParse(jsonSafeParse(response));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error.message);
  }

  return result.data;
};

const createAliyunSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: aliyunSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createAliyunSmsConnector;
