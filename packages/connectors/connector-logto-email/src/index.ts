import { assert, conditional } from '@silverhand/essentials';

import type router from '@logto/cloud/routes';
import type {
  CreateConnector,
  EmailConnector,
  GetCloudServiceClient,
  GetConnectorConfig,
  GetUsageFunction,
  SendMessageFunction,
} from '@logto/connector-kit';
import {
  ConnectorType,
  validateConfig,
  ConnectorError,
  ConnectorErrorCodes,
} from '@logto/connector-kit';

import { defaultMetadata, emailEndpoint, usageEndpoint } from './constant.js';
import { logtoEmailConfigGuard } from './types.js';

const sendMessage =
  (
    getConfig: GetConnectorConfig,
    getClient?: GetCloudServiceClient<typeof router>
  ): SendMessageFunction =>
  async (data, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, logtoEmailConfigGuard);

    const { companyInformation, senderName, appLogo } = config;
    const { to, type, payload } = data;

    assert(getClient, new ConnectorError(ConnectorErrorCodes.NotImplemented));
    const client = await getClient();

    try {
      await client.post(`/api${emailEndpoint}`, {
        body: {
          data: {
            to,
            type,
            payload: {
              ...payload,
              ...conditional(senderName && { senderName }),
              ...conditional(companyInformation && { companyInformation }),
              ...conditional(appLogo && { appLogo }),
            },
          },
        },
      });
    } catch (error: unknown) {
      // The hosted email service returns 429 once the tenant's usage cap is reached. Its cloud
      // client throws an error carrying a numeric HTTP `status`; detect that structurally (rather
      // than coupling to the client's error class) and convert it to a dedicated usage-limit
      // ConnectorError, so the middleware maps it back to a 429 for the caller instead of an opaque
      // 500. This is distinct from a rate limit — the cap persists until the quota resets or is raised.
      if (error instanceof Error && 'status' in error && error.status === 429) {
        throw new ConnectorError(ConnectorErrorCodes.UsageLimitExceeded);
      }

      throw error;
    }
  };

const getUsage =
  (
    getConfig: GetConnectorConfig,
    getClient?: GetCloudServiceClient<typeof router>
  ): GetUsageFunction =>
  async (startFrom?: Date) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, logtoEmailConfigGuard);

    assert(getClient, new ConnectorError(ConnectorErrorCodes.NotImplemented));
    const client = await getClient();

    const { count } = await client.get(`/api${usageEndpoint}`, {
      search: conditional(startFrom && { from: startFrom.toISOString() }) ?? {},
    });
    return count;
  };

const createLogtoEmailConnector: CreateConnector<EmailConnector, typeof router> = async ({
  getConfig,
  getCloudServiceClient: getClient,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: logtoEmailConfigGuard,
    sendMessage: sendMessage(getConfig, getClient),
    getUsage: getUsage(getConfig, getClient),
  };
};

export default createLogtoEmailConnector;
