import { adminTenantId, defaultTenantId } from '@logto/schemas';
import type { UrlSet } from '@logto/shared';
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

const matchDomainBasedTenantId = (pattern: URL, url: URL) => {
  const toMatch = pattern.hostname.replace('*', '([^.]*)');
  const matchedId = new RegExp(toMatch).exec(url.hostname)?.[1];

  if (!matchedId || matchedId === '*') {
    return;
  }

  if (isEndpointOf(url, getTenantEndpoint(matchedId, EnvSet.values))) {
    return matchedId;
  }
};

const matchPathBasedTenantId = (urlSet: UrlSet, url: URL) => {
  const found = urlSet.deduplicated().find((value) => isEndpointOf(url, value));

  if (!found) {
    return;
  }

  const urlSegments = url.pathname.split('/');
  const endpointSegments = found.pathname.split('/');

  return urlSegments[found.pathname === '/' ? 1 : endpointSegments.length];
};

export const getTenantId = (url: URL) => {
  const {
    isMultiTenancy,
    isPathBasedMultiTenancy,
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

  if (!isMultiTenancy) {
    return defaultTenantId;
  }

  if (isPathBasedMultiTenancy) {
    return matchPathBasedTenantId(urlSet, url);
  }

  return matchDomainBasedTenantId(urlSet.endpoint, url);
};
