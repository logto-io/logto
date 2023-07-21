import { assert } from '@silverhand/essentials';
import { HTTPError, got } from 'got';
import { z } from 'zod';

import type {
  CreateConnector,
  EmailConnector,
  GetConnectorConfig,
  GetUsageFunction,
  SendMessageFunction,
} from '@logto/connector-kit';
import {
  ConnectorType,
  validateConfig,
  ConnectorError,
  ConnectorErrorCodes,
  parseJson,
} from '@logto/connector-kit';

import { defaultMetadata, defaultTimeout, emailEndpoint, usageEndpoint } from './constant.js';
import { grantAccessToken } from './grant-access-token.js';
import type { LogtoEmailConfig } from './types.js';
import { logtoEmailConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<LogtoEmailConfig>(config, logtoEmailConfigGuard);

    const {
      endpoint,
      tokenEndpoint,
      appId,
      appSecret,
      resource,
      companyInformation,
      senderName,
      appLogo,
    } = config;
    const { to, type, payload } = data;

    assert(
      endpoint && tokenEndpoint && resource && appId && appSecret,
      new ConnectorError(ConnectorErrorCodes.InvalidConfig)
    );

    const accessTokenResponse = await grantAccessToken({
      tokenEndpoint,
      resource,
      appId,
      appSecret,
    });

    try {
      await got.post({
        url: `${endpoint}${emailEndpoint}`,
        headers: {
          Authorization: `${accessTokenResponse.token_type} ${accessTokenResponse.access_token}`,
        },
        json: {
          data: { to, type, payload: { ...payload, senderName, companyInformation, appLogo } },
        },
        timeout: { request: defaultTimeout },
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        console.log('error');
      }

      throw error;
    }
  };

const getUsage =
  (getConfig: GetConnectorConfig): GetUsageFunction =>
  async (startFrom?: Date) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<LogtoEmailConfig>(config, logtoEmailConfigGuard);

    const { endpoint, tokenEndpoint, appId, appSecret, resource } = config;

    assert(
      endpoint && tokenEndpoint && resource && appId && appSecret,
      new ConnectorError(ConnectorErrorCodes.InvalidConfig)
    );

    const accessTokenResponse = await grantAccessToken({
      tokenEndpoint,
      resource,
      appId,
      appSecret,
    });

    const httpResponse = await got.get({
      url: `${endpoint}${usageEndpoint}`,
      headers: {
        Authorization: `${accessTokenResponse.token_type} ${accessTokenResponse.access_token}`,
      },
      timeout: { request: defaultTimeout },
      searchParams: {
        from: startFrom?.toISOString(),
      },
    });

    return z.object({ count: z.number() }).parse(parseJson(httpResponse.body)).count;
  };

const createLogtoEmailConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: logtoEmailConfigGuard,
    sendMessage: sendMessage(getConfig),
    getUsage: getUsage(getConfig),
  };
};

export default createLogtoEmailConnector;
