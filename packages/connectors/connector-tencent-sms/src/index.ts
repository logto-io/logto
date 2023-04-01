import type {
  CreateConnector,
  GetConnectorConfig,
  SendMessageFunction,
  SmsConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  validateConfig,
} from '@logto/connector-kit';
import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import { defaultMetadata } from './constant.js';
import { isSmsErrorResponse, sendSmsRequest } from './http.js';
import type { TencentSmsConfig } from './schema.js';
import { SmsConfigGuard, tencentErrorResponse } from './schema.js';

function safeGetArray<T>(value: Array<T | undefined>, index: number): T {
  const item = value[index];

  assert(
    item,
    new ConnectorError(ConnectorErrorCodes.General, `Cannot find item at index ${index}`)
  );

  return item;
}

function sendMessage(getConfig: GetConnectorConfig): SendMessageFunction {
  return async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<TencentSmsConfig>(config, SmsConfigGuard);
    const { accessKeyId, accessKeySecret, signName, templates, sdkAppId, region } = config;
    const template = templates.find(({ usageType }) => usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    try {
      const httpResponse = await sendSmsRequest(template.templateCode, [payload.code], to, {
        secretId: accessKeyId,
        secretKey: accessKeySecret,
        sdkAppId,
        region,
        signName,
      });

      const { body: responseData } = httpResponse;
      const isError = isSmsErrorResponse(responseData);

      if (isError) {
        const { Response } = responseData;
        const { Error } = Response;
        throw new ConnectorError(ConnectorErrorCodes.General, `${Error.Code}: ${Error.Message}`);
      }

      const {
        Response: { SendStatusSet, RequestId },
      } = responseData;

      const { Code, Message } = safeGetArray(SendStatusSet, 0);

      assert(
        Code.toLowerCase() === 'ok',
        new ConnectorError(
          ConnectorErrorCodes.General,
          `${Code}: ${Message}, RequestId: ${RequestId}`
        )
      );

      return httpResponse;
    } catch (error: unknown) {
      if (!(error instanceof HTTPError)) {
        throw error;
      }

      const {
        response: { body: rawBody },
        message,
      } = error;

      const result = tencentErrorResponse.safeParse(rawBody);

      if (result.success) {
        const { Error } = result.data.Response;
        const { Message, Code } = Error;

        throw new ConnectorError(ConnectorErrorCodes.General, {
          errorDescription: Message,
          Code,
          ...result,
        });
      }

      throw new ConnectorError(ConnectorErrorCodes.General, `Request error: ${message}`);
    }
  };
}

const createTencentSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: SmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createTencentSmsConnector;
