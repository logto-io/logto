import type {
  GetAuthorizationUri,
  SocialConnector,
  CreateConnector,
  GetConnectorConfig,
} from '@logto/connector-kit';
import { validateConfig, ConnectorType } from '@logto/connector-kit';

import { defaultMetadata, getProviderConfigs } from './constant.js';
import type { SocialDemoConfig } from './types.js';
import { socialDemoConfigGuard } from './types.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state }) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<SocialDemoConfig>(config, socialDemoConfigGuard);

    const { provider, clientId, redirectUri } = config;

    const { params, endpoint } = getProviderConfigs(provider);

    const queryParameters = new URLSearchParams({
      ...params,
      client_id: clientId,
      redirect_uri: redirectUri, // Use preset redirect uri
      state,
    });

    return `${endpoint}?${queryParameters.toString()}`;
  };

const createSocialDemoConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: socialDemoConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: async () => {
      throw new Error('Not implemented');
    },
  };
};

export default createSocialDemoConnector;
