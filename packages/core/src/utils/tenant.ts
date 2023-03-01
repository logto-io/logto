import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';

const normalizePathname = (pathname: string) =>
  pathname + conditionalString(!pathname.endsWith('/') && '/');

const isEndpointOf = (current: URL, endpoint: URL) => {
  // Make sure current pathname fragments start with endpoint's
  return (
    current.origin === endpoint.origin &&
    normalizePathname(current.pathname).startsWith(normalizePathname(endpoint.pathname))
  );
};

export const getTenantId = (url: URL) => {
  const {
    isDomainBasedMultiTenancy,
    isProduction,
    isIntegrationTest,
    developmentTenantId,
    urlSet,
    adminUrlSet,
  } = EnvSet.values;

  if (adminUrlSet.deduplicated().some((endpoint) => isEndpointOf(url, endpoint))) {
    return adminTenantId;
  }

  if ((!isProduction || isIntegrationTest) && developmentTenantId) {
    console.log(`Found dev tenant ID ${developmentTenantId}.`);

    return developmentTenantId;
  }

  if (
    !isDomainBasedMultiTenancy ||
    (!urlSet.isLocalhostDisabled && isEndpointOf(url, urlSet.localhostUrl))
  ) {
    return defaultTenantId;
  }

  const toMatch = urlSet.endpoint.hostname.replace('*', '([^.]*)');
  const matchedId = new RegExp(toMatch).exec(url.hostname)?.[1];

  if (!matchedId || matchedId === '*') {
    return;
  }

  if (isEndpointOf(url, getTenantEndpoint(matchedId, EnvSet.values))) {
    return matchedId;
  }
};
