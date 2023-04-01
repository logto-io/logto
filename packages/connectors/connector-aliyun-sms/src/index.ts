import type {
  GetConnectorConfig,
  SendMessageFunction,
  SmsConnector,
  CreateConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  parseJson,
} from '@logto/connector-kit';
import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import { defaultMetadata } from './constant.js';
import { sendSms } from './single-send-text.js';
import type { AliyunSmsConfig, Template } from './types.js';
import { aliyunSmsConfigGuard, sendSmsResponseGuard } from './types.js';

const isChinaNumber = (to: string) => /^(\+86|0086|86)?\d{11}$/.test(to);

const getTemplateCode = ({ templateCode }: Template, to: string) => {
  if (typeof templateCode === 'string') {
    return templateCode;
  }

  return isChinaNumber(to) ? templateCode.china : templateCode.overseas;
};

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
          TemplateCode: getTemplateCode(template, to),
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
  const result = sendSmsResponseGuard.safeParse(parseJson(response));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
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
