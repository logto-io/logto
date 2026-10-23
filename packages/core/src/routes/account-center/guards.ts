import { AccountCenters, accountCenterFieldControlGuard } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

export const getAccountCenterApiGuards = () => {
  // DEV: Self-service personal access tokens
  const personalAccessTokenOmitMask = EnvSet.values.isDevFeaturesEnabled
    ? {}
    : { personalAccessToken: true as const };
  const fields = accountCenterFieldControlGuard.omit(personalAccessTokenOmitMask);

  // DEV: OIDC step-up authentication. The Account API does not enforce the window while the
  // feature is in development, so the response omits it.
  const maximumAuthenticationAgeInSecondsOmitMask = EnvSet.values.isDevFeaturesEnabled
    ? {}
    : { maximumAuthenticationAgeInSeconds: true as const };

  return {
    fields,
    accountCenter: AccountCenters.guard
      .extend({ fields })
      .omit(maximumAuthenticationAgeInSecondsOmitMask),
  };
};
