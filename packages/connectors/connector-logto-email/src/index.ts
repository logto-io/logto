import { assert, conditional } from '@silverhand/essentials';
import { HTTPError } from 'got';
import { z } from 'zod';

import type {
  CreateConnector,
  EmailConnector,
  GetAuthedCloudServiceApi,
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

import { defaultMetadata, emailEndpoint, usageEndpoint } from './constant.js';
import { logtoEmailConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig, getAuthedApi?: GetAuthedCloudServiceApi): SendMessageFunction =>
  async (data, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, logtoEmailConfigGuard);

    const { companyInformation, senderName, appLogo } = config;
    const { to, type, payload } = data;

    assert(getAuthedApi, new ConnectorError(ConnectorErrorCodes.NotImplemented));
    const authedApi = await getAuthedApi();

    try {
      await authedApi.post(emailEndpoint, {
        json: {
          data: { to, type, payload: { ...payload, senderName, companyInformation, appLogo } },
        },
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        console.log('error');
      }

      throw error;
    }
  };

const getUsage =
  (getConfig: GetConnectorConfig, getAuthedApi?: GetAuthedCloudServiceApi): GetUsageFunction =>
  async (startFrom?: Date) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, logtoEmailConfigGuard);

    assert(getAuthedApi, new ConnectorError(ConnectorErrorCodes.NotImplemented));
    const authedApi = await getAuthedApi();

    const httpResponse = await authedApi.get(usageEndpoint, {
      searchParams: conditional(startFrom && { from: startFrom.toISOString() }),
    });

    const guard = z.object({ count: z.number() });
    const result = guard.safeParse(parseJson(httpResponse.body));

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
    }

    return result.data.count;
  };

const createLogtoEmailConnector: CreateConnector<EmailConnector> = async ({
  getConfig,
  getAuthedCloudServiceApi: getAuthedApi,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: logtoEmailConfigGuard,
    sendMessage: sendMessage(getConfig, getAuthedApi),
    getUsage: getUsage(getConfig, getAuthedApi),
  };
};

export default createLogtoEmailConnector;
