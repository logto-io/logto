import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

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
  getConfigTemplateByType,
} from '@logto/connector-kit';
import { PhoneNumberParser } from '@logto/shared';

import { defaultMetadata } from './constant.js';
import { sendSmsVerifyCode } from './send-verify-code.js';
import type { Template } from './types.js';
import { aliyunSmsMasConfigGuard, sendSmsVerifyCodeResponseGuard } from './types.js';
import { mainlandChinaCountryCode } from './utils.js';

const getTemplateCode = ({ templateCode }: Template) => templateCode;

/**
 * Parse the JSON response string from SendSmsVerifyCode API
 */
const parseVerifyCodeResponseString = (response: string) => {
  const result = sendSmsVerifyCodeResponseGuard.safeParse(parseJson(response));
  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }
  return result.data;
};

/**
 * Parse and validate a phone number as mainland China number.
 * Uses PhoneNumberParser (libphonenumber-js) for robust validation.
 * Throws InvalidRequestParameters if the number is not a valid +86 number.
 * Returns the national number (e.g., "13012345678") for MAS API.
 */
const parseMainlandChinaPhoneNumber = (phone: string): string => {
  const parser = new PhoneNumberParser(phone);

  if (!parser.isValid || parser.countryCode !== mainlandChinaCountryCode) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidRequestParameters, {
      errorDescription:
        'Phone number must be a valid China mainland mobile number with country code +86.',
      phoneNumber: phone,
    });
  }

  if (!parser.nationalNumber) {
    throw new ConnectorError(ConnectorErrorCodes.General, {
      errorDescription: 'Failed to parse national number from phone number.',
      phoneNumber: phone,
    });
  }

  return parser.nationalNumber;
};

/**
 * Send SMS verification code
 *
 * This connector only supports China mainland mobile numbers.
 * Phone validation uses libphonenumber-js via PhoneNumberParser to ensure
 * the number is a valid +86 number before sending the request.
 *
 * Logto uses a fixed 10-minute verification code expiration time:
 * @see https://docs.logto.io/zh-CN/connectors/sms-connectors/sms-templates
 */
const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, aliyunSmsMasConfigGuard);
    const { accessKeyId, accessKeySecret, signName } = config;

    const template = getConfigTemplateByType(type, config);
    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    // Validate and parse phone number as mainland China number
    const nationalNumber = parseMainlandChinaPhoneNumber(to);

    // Remove locale from payload as it's not needed for MAS API
    const { locale, ...filteredPayload } = payload;

    // Logto uses fixed 10-minute expiration time
    // min parameter is used in template: "您的验证码是${code}，有效期${min}分钟，请勿告诉他人。"
    const masPayload = { ...filteredPayload, min: '10' };

    try {
      const httpResponse = await sendSmsVerifyCode(
        {
          AccessKeyId: accessKeyId,
          CountryCode: mainlandChinaCountryCode,
          PhoneNumber: nationalNumber,
          SignName: signName,
          TemplateCode: getTemplateCode(template),
          TemplateParam: JSON.stringify(masPayload),
        },
        accessKeySecret
      );

      const { Code, Message, ...rest } = parseVerifyCodeResponseString(httpResponse.body);
      assert(
        Code === 'OK',
        new ConnectorError(
          Code === 'BUSINESS_LIMIT_CONTROL' || Code === 'FREQUENCY_FAIL'
            ? ConnectorErrorCodes.RateLimitExceeded
            : Code === 'MOBILE_NUMBER_ILLEGAL'
              ? ConnectorErrorCodes.InvalidRequestParameters
              : ConnectorErrorCodes.General,
          { errorDescription: Message, Code, ...rest }
        )
      );

      return { Code, Message, ...rest };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody },
        } = error;
        assert(
          typeof rawBody === 'string',
          new ConnectorError(
            ConnectorErrorCodes.InvalidResponse,
            `Invalid response raw body type: ${typeof rawBody}`
          )
        );
        const result = sendSmsVerifyCodeResponseGuard.safeParse(parseJson(rawBody));
        if (!result.success) {
          throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
        }
        const { Message, ...rest } = result.data;
        throw new ConnectorError(ConnectorErrorCodes.General, {
          errorDescription: Message,
          ...rest,
        });
      }
      throw error;
    }
  };

const createAliyunSmsMasConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => ({
  metadata: defaultMetadata,
  type: ConnectorType.Sms,
  configGuard: aliyunSmsMasConfigGuard,
  sendMessage: sendMessage(getConfig),
});

export default createAliyunSmsMasConnector;
