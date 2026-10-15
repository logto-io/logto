import { AccountCenters, accountCenterFieldControlGuard } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

export const getAccountCenterApiGuards = () => {
  // DEV: Self-service personal access tokens
  const personalAccessTokenOmitMask = EnvSet.values.isDevFeaturesEnabled
    ? {}
    : { personalAccessToken: true as const };
  const fields = accountCenterFieldControlGuard.omit(personalAccessTokenOmitMask);

  return {
    fields,
    accountCenter: AccountCenters.guard.extend({ fields }),
  };
};
