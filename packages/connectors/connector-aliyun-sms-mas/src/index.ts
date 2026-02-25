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

/**
 * Get template code from template config
 * For MAS, template code is the system-provided template ID (e.g., '100001')
 */
const getTemplateCode = ({ templateCode }: Template) => {
  return templateCode;
};

/**
 * Send message function
 * This is the core function that sends SMS via Aliyun Message Authentication Service
 */
const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, aliyunSmsMasConfigGuard);
    const { accessKeyId, accessKeySecret, signName } = config;

    // Get template by usage type (SignIn, Register, etc.)
    const template = getConfigTemplateByType(type, config);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    // Filter out locale key as it may contain special characters (e.g., zh-CN)
    // Aliyun SMS API only accepts [a-zA-Z0-9] values in the payload
    const { locale, ...filteredPayload } = payload;

    // Add default min parameter (10 minutes) if not provided
    // This matches Logto's default verification code expiration time
    const masPayload = { ...filteredPayload, min: filteredPayload.min ?? '10' };

    try {
      // Call Aliyun MAS API to send verification code SMS
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

      // Parse and validate the response
      const { Code, Message, ...rest } = parseVerifyCodeResponseString(httpResponse.body);

      // Check if the API call was successful
      assert(
        Code === 'OK',
        new ConnectorError(
          // Map Aliyun's rate limit error to Logto's rate limit error
          Code === 'BUSINESS_LIMIT_CONTROL'
            ? ConnectorErrorCodes.RateLimitExceeded
            : ConnectorErrorCodes.General,
          {
            errorDescription: Message,
            Code,
            ...rest,
          }
        )
      );

      return { Code, Message, ...rest };
    } catch (error: unknown) {
      // Handle HTTP errors from got
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

        // Parse and validate error response
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

      // Re-throw other errors
      throw error;
    }
  };

/**
 * Parse and validate the response string from Aliyun MAS API
 * @param response - The raw response body string
 * @returns Parsed response data with Model flattened
 */
const parseVerifyCodeResponseString = (response: string) => {
  const result = sendSmsVerifyCodeResponseGuard.safeParse(parseJson(response));

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  // Flatten the Model object into the response
  // Model contains additional fields like VerifyCode, BizId, etc.
  const { Model, ...rest } = result.data;
  return { ...rest, ...Model };
};

/**
 * Create the connector instance
 * This is the entry point for Logto to create the connector
 */
const createAliyunSmsMasConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: aliyunSmsMasConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createAliyunSmsMasConnector;
