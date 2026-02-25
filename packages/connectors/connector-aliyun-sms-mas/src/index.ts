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

import { defaultMetadata } from './constant.js';
import { sendSmsVerifyCode } from './send-verify-code.js';
import type { Template } from './types.js';
import { aliyunSmsMasConfigGuard, sendSmsVerifyCodeResponseGuard } from './types.js';

const getTemplateCode = ({ templateCode }: Template) => templateCode;

/**
 * Parse the JSON response string from SendSmsVerifyCode API
 * Extracts Model fields into the top level for easier access
 */
const parseVerifyCodeResponseString = (response: string) => {
  const result = sendSmsVerifyCodeResponseGuard.safeParse(parseJson(response));
  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }
  const { Model, ...rest } = result.data;
  return { ...rest, ...Model };
};

/**
 * Send SMS verification code
 *
 * Note: This connector only supports China mainland mobile numbers.
 * The phone number should be provided without country code (e.g., "13012345678").
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

    // Remove locale from payload as it's not needed for MAS API
    const { locale, ...filteredPayload } = payload;

    // Logto uses fixed 10-minute expiration time
    // min parameter is used in template: "您的验证码是${code}，有效期${min}分钟，请勿告诉他人。"
    const masPayload = { ...filteredPayload, min: '10' };

    try {
      const httpResponse = await sendSmsVerifyCode(
        {
          AccessKeyId: accessKeyId,
          PhoneNumber: to,
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
          Code === 'BUSINESS_LIMIT_CONTROL'
            ? ConnectorErrorCodes.RateLimitExceeded
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
