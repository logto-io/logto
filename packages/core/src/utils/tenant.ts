import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { type UrlSet } from '@logto/shared';
import { conditionalString, trySafe } from '@silverhand/essentials';
import { type CommonQueryMethods } from '@silverhand/slonik';

import { redisCache } from '#src/caches/index.js';
import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { createDomainsQueries } from '#src/queries/domains.js';
import { consoleLog } from '#src/utils/console.js';

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

const cacheKey = 'custom-domain';
const getDomainCacheKey = (url: URL | string) =>
  `${cacheKey}:${typeof url === 'string' ? url : url.hostname}`;

export const clearCustomDomainCache = async (url: URL | string) => {
  await trySafe(async () => redisCache.delete(getDomainCacheKey(url)));
};

const getTenantIdFromCustomDomain = async (
  url: URL,
  pool: CommonQueryMethods
): Promise<string | undefined> => {
  const cachedValue = await trySafe(async () => redisCache.get(getDomainCacheKey(url)));

  if (cachedValue) {
    return cachedValue;
  }

  const { findActiveDomain } = createDomainsQueries(pool);

  const domain = await findActiveDomain(url.hostname);

  if (domain?.tenantId) {
    await trySafe(async () => redisCache.set(getDomainCacheKey(url), domain.tenantId));
  }

  return domain?.tenantId;
};

export const getTenantId = async (url: URL) => {
  const {
    values: {
      isMultiTenancy,
      isPathBasedMultiTenancy,
      isProduction,
      isIntegrationTest,
      developmentTenantId,
      urlSet,
      adminUrlSet,
    },
    sharedPool,
  } = EnvSet;
  const pool = await sharedPool;

  if (adminUrlSet.deduplicated().some((endpoint) => isEndpointOf(url, endpoint))) {
    return adminTenantId;
  }

  if ((!isProduction || isIntegrationTest) && developmentTenantId) {
    consoleLog.warn(`Found dev tenant ID ${developmentTenantId}.`);

    return developmentTenantId;
  }

  if (!isMultiTenancy) {
    return defaultTenantId;
  }

  if (isPathBasedMultiTenancy) {
    return matchPathBasedTenantId(urlSet, url);
  }

  const customDomainTenantId = await getTenantIdFromCustomDomain(url, pool);

  if (customDomainTenantId) {
    return customDomainTenantId;
  }

  return matchDomainBasedTenantId(urlSet.endpoint, url);
};
