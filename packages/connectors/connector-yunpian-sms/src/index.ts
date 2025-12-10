import { assert } from '@silverhand/essentials';
import { got, RequestError } from 'got';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  SmsConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  replaceSendMessageHandlebars,
  getConfigTemplateByType,
} from '@logto/connector-kit';

import { defaultMetadata, endpoint } from './constant.js';
import {
  yunpianSmsConfigGuard,
  type YunpianSmsPayload,
  yunpianErrorResponseGuard,
} from './types.js';

const isChinaPhoneNumber = (phone: string) => {
  // Match formats:
  // 1. +86 followed by 11 digits, first digit must be 1
  // 2. 86 followed by 11 digits, first digit must be 1
  const pattern = /^(\+?86)1[3-9]\d{9}$/;

  return pattern.test(phone);
};

const formatPhoneNumber = (phoneNumber: string) => {
  const phone = phoneNumber.replaceAll(/\s/g, '');

  if (!isChinaPhoneNumber(phone)) {
    if (!phone.startsWith('+')) {
      return `+${phone}`;
    }
    return phone;
  }

  // If it starts with +86 or 86, truncate the last 11 digits
  if (phone.startsWith('+86')) {
    return phone.slice(3);
  }
  if (phone.startsWith('86')) {
    return phone.slice(2);
  }

  return phone;
};

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, yunpianSmsConfigGuard);
    const { apikey, enableInternational, unsupportedCountriesMsg } = config;

    const template = getConfigTemplateByType(type, config);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `No SMS template found for type ${type}`
      )
    );

    const messageContent = replaceSendMessageHandlebars(template.content, payload);

    const formattedPhone = formatPhoneNumber(to);

    if (!enableInternational && formattedPhone.startsWith('+')) {
      if (unsupportedCountriesMsg) {
        throw new ConnectorError(ConnectorErrorCodes.General, unsupportedCountriesMsg);
      } else {
        console.warn(`connector-yunpian-sms: unsupported phone number: ${formattedPhone}`);
        return;
      }
    }

    const body: YunpianSmsPayload = {
      apikey,
      mobile: formattedPhone,
      text: messageContent,
    };

    try {
      return await got.post(endpoint, {
        form: body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Accept: 'application/json;charset=utf-8',
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof RequestError &&
        error.response?.statusCode === 400 &&
        typeof error.response.body === 'string'
      ) {
        const errorBody = yunpianErrorResponseGuard.parse(JSON.parse(error.response.body));
        console.warn('connector-yunpian-sms: send error', errorBody);

        if (errorBody.msg) {
          throw new ConnectorError(ConnectorErrorCodes.General, errorBody.msg);
        }
      }

      console.warn('connector-yunpian-sms: send unknown error', error);
      throw new ConnectorError(ConnectorErrorCodes.General, `Unknown error: ${String(error)}`);
    }
  };

const createYunpianSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: yunpianSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createYunpianSmsConnector;
