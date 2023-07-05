import { cloudConnectionDataGuard } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

import { type LogtoConfigLibrary } from './logto-config.js';

export type CloudConnectionLibrary = ReturnType<typeof createCloudConnectionLibrary>;

// eslint-disable-next-line import/no-unused-modules
export const cloudConnectionGuard = cloudConnectionDataGuard.extend({
  tokenEndpoint: z.string(),
  endpoint: z.string(),
});

// eslint-disable-next-line import/no-unused-modules
export type CloudConnection = z.infer<typeof cloudConnectionGuard>;

export const createCloudConnectionLibrary = (logtoConfigs: LogtoConfigLibrary) => {
  const { getCloudConnectionData: getCloudServiceM2mCredentials } = logtoConfigs;

  const getCloudConnectionData = async (): Promise<CloudConnection> => {
    const credentials = await getCloudServiceM2mCredentials();
    const { cloudUrlSet, adminUrlSet } = EnvSet.values;
    return {
      ...credentials,
      tokenEndpoint: appendPath(adminUrlSet.endpoint, 'oidc/token').toString(),
      endpoint: appendPath(cloudUrlSet.endpoint, 'api').toString(),
    };
  };

  return { getCloudConnectionData };
};
