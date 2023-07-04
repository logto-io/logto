import { appendPath } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';

export const getCloudConnectionEndpoints = () => {
  const { cloudUrlSet, adminUrlSet } = EnvSet.values;
  return {
    tokenEndpoint: appendPath(adminUrlSet.endpoint, 'oidc/token').toString(),
    endpoint: appendPath(cloudUrlSet.endpoint, 'api').toString(),
  };
};
