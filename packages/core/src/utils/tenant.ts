import { adminTenantId, defaultTenantId } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

export const getTenantId = (url: URL) => {
  const {
    isDomainBasedMultiTenancy,
    isProduction,
    isIntegrationTest,
    developmentTenantId,
    urlSet,
    adminUrlSet,
  } = EnvSet.values;

  if ((!isProduction || isIntegrationTest) && developmentTenantId) {
    return developmentTenantId;
  }

  const urlString = url.toString();

  if (adminUrlSet.deduplicated().some((value) => urlString.startsWith(value))) {
    return adminTenantId;
  }

  if (
    !isDomainBasedMultiTenancy ||
    (!urlSet.isLocalhostDisabled && urlString.startsWith(urlSet.localhostUrl))
  ) {
    return defaultTenantId;
  }

  return new RegExp(urlSet.endpoint.replace('*', '([^.]*)')).exec(urlString)?.[1];
};
