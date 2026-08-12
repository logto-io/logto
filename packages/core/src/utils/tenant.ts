import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { type UrlSet } from '@logto/shared';
import { conditionalString, trySafe } from '@silverhand/essentials';
import { type CommonQueryMethods } from '@silverhand/slonik';

import {
  invalidateWithGeneration,
  snapshotGeneration,
  type GuardedKeys,
} from '#src/caches/generation.js';
import { redisCache } from '#src/caches/index.js';
import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { createDomainsQueries } from '#src/queries/domains.js';

import { devConsole } from './console.js';

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

/**
 * The marker gets its own prefix rather than a segment inside the value keyspace: the two
 * prefixes diverge before the hostname is appended, so no hostname — whatever the `domains`
 * column happens to hold — can spell a key belonging to the other.
 */
const getDomainKeys = (url: URL | string): GuardedKeys => {
  const hostname = typeof url === 'string' ? url : url.hostname;

  return {
    value: `custom-domain:${hostname}`,
    generation: `custom-domain-generation:${hostname}`,
  };
};

/**
 * Invalidate the cached mapping for the given custom domain after the mutation it reflects
 * has been committed. See {@link invalidateWithGeneration} for the ordering guarantee it
 * provides and the bounds it comes with, and note it requires callers to await it before
 * returning to their own caller.
 */
export const clearCustomDomainCache = async (url: URL | string) => {
  await invalidateWithGeneration(redisCache, getDomainKeys(url));
};

/**
 * Get tenant ID from the custom domain URL.
 */
const getTenantIdFromCustomDomain = async (
  url: URL,
  pool: CommonQueryMethods
): Promise<string | undefined> => {
  const keys = getDomainKeys(url);
  /**
   * The snapshot only has to be taken before the database read starts, so it rides along with
   * the value read instead of costing a second round trip on a path that runs per request.
   * Snapshotting earlier observes a superset of the invalidations it otherwise would.
   */
  const [cachedValue, writeBackIfFresh] = await Promise.all([
    trySafe(async () => redisCache.get(keys.value)),
    snapshotGeneration(redisCache, keys),
  ]);

  if (cachedValue) {
    return cachedValue;
  }

  const { findActiveDomain } = createDomainsQueries(pool);

  const domain = await findActiveDomain(url.hostname);

  // A missing mapping is left uncached, so probes for unknown hostnames cannot fill the store.
  if (!domain?.tenantId) {
    return;
  }

  await writeBackIfFresh(async () => redisCache.set(keys.value, domain.tenantId));

  return domain.tenantId;
};

/**
 * Get tenant ID from the current request's URL.
 *
 * @param url The current request's URL
 * @returns The tenant ID and whether the URL is a custom domain
 */
export const getTenantId = async (
  url: URL
): Promise<[tenantId: string | undefined, isCustomDomain: boolean]> => {
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
    return [adminTenantId, false];
  }

  if ((!isProduction || isIntegrationTest) && developmentTenantId) {
    devConsole.warn(`Found dev tenant ID ${developmentTenantId}.`);

    return [developmentTenantId, false];
  }

  if (!isMultiTenancy) {
    return [defaultTenantId, false];
  }

  if (isPathBasedMultiTenancy) {
    return [matchPathBasedTenantId(urlSet, url), false];
  }

  const customDomainTenantId = await getTenantIdFromCustomDomain(url, pool);

  if (customDomainTenantId) {
    return [customDomainTenantId, true];
  }

  return [matchDomainBasedTenantId(urlSet.endpoint, url), false];
};
