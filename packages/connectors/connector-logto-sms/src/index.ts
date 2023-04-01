import type {
  CreateConnector,
  GetConnectorConfig,
  SendMessageFunction,
  SmsConnector,
} from '@logto/connector-kit';
import { ConnectorType, validateConfig } from '@logto/connector-kit';
import { HTTPError, got } from 'got';

import { defaultMetadata, defaultTimeout, smsEndpoint } from './constant.js';
import { grantAccessToken } from './grant-access-token.js';
import type { LogtoSmsConfig } from './types.js';
import { logtoSmsConfigGuard } from './types.js';

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig<LogtoSmsConfig>(config, logtoSmsConfigGuard);

    const { endpoint, tokenEndpoint, appId, appSecret, resource } = config;

    const accessTokenResponse = await grantAccessToken({
      tokenEndpoint,
      resource,
      appId,
      appSecret,
    });

    try {
      await got.post({
        url: `${endpoint}${smsEndpoint}`,
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

const createLogtoSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: logtoSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createLogtoSmsConnector;
