import { appendPath } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';

/** Will use this method in upcoming changes. */
// eslint-disable-next-line import/no-unused-modules
export const getCloudConnectionEndpoints = async () => {
  const { cloudUrlSet, adminUrlSet } = EnvSet.values;
  return {
    tokenEndpoint: appendPath(adminUrlSet.endpoint, 'oidc/token').toString(),
    endpoint: appendPath(cloudUrlSet.endpoint, 'api').toString(),
  };
};
