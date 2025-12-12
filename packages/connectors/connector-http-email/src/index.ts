import { assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  EmailConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
} from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { httpMailConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload, ip } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, httpMailConfigGuard);
    const { endpoint, authorization } = config;

    try {
      return await got.post(endpoint, {
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
        json: {
          to,
          type,
          payload,
          ...(ip && { ip }),
        },
      });
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

        throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
      }

      throw new ConnectorError(ConnectorErrorCodes.General, error);
    }
  };

const createHttpMailConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: httpMailConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createHttpMailConnector;
