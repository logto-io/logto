import { AccountCenters, accountCenterFieldControlGuard } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

export const getAccountCenterApiGuards = () => {
  // DEV: MFA trusted devices
  const trustedDeviceOmitMask = EnvSet.values.isDevFeaturesEnabled
    ? {}
    : { trustedDevice: true as const };
  const fields = accountCenterFieldControlGuard.omit(trustedDeviceOmitMask);

  return {
    fields,
    accountCenter: AccountCenters.guard.extend({ fields }),
  };
};
