import type {
  CreateConnector,
  EmailConnector,
  GetConnectorConfig,
  SendMessageFunction,
} from '@logto/connector-kit';
import { ConnectorType, validateConfig } from '@logto/connector-kit';
import { HTTPError, got } from 'got';

import { defaultMetadata, defaultTimeout, emailEndpoint } from './constant.js';
import { grantAccessToken } from './grant-access-token.js';
import type { LogtoEmailConfig } from './types.js';
import { logtoEmailConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<LogtoEmailConfig>(config, logtoEmailConfigGuard);

    const { endpoint, tokenEndpoint, appId, appSecret, resource } = config;

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
        json: { data },
        timeout: { request: defaultTimeout },
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        console.log('error');
      }

      throw error;
    }
  };

const createLogtoEmailConnector: CreateConnector<EmailConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Email,
    configGuard: logtoEmailConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createLogtoEmailConnector;
