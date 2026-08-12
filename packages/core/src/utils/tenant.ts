import { adminTenantId, defaultTenantId } from '@logto/schemas';
import { generateStandardShortId, type UrlSet } from '@logto/shared';
import { conditionalString, trySafe } from '@silverhand/essentials';
import { type CommonQueryMethods } from '@silverhand/slonik';

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

const cacheKey = 'custom-domain';
const getHostname = (url: URL | string) => (typeof url === 'string' ? url : url.hostname);
const getDomainCacheKey = (url: URL | string) => `${cacheKey}:${getHostname(url)}`;
/**
 * Hostnames cannot contain `:`, so the `generation` segment can never collide with a
 * {@link getDomainCacheKey} value key.
 */
const getDomainGenerationKey = (url: URL | string) => `${cacheKey}:generation:${getHostname(url)}`;

/**
 * Invalidate the cached mapping for the given custom domain after the mutation it reflects
 * has been committed.
 *
 * The generation must be bumped before deleting, and both must be awaited: this guarantees
 * that once this function resolves, an in-flight {@link getTenantIdFromCustomDomain} lookup
 * that read pre-mutation state either skips its write-back or has it removed by the deletion.
 * (The same guard as `BaseCache`, which this cache cannot build on since it is cross-tenant.)
 *
 * Store errors are silently caught, as an invalidation failure degrades to staleness bounded
 * by the value TTL rather than a failed domain mutation.
 */
export const clearCustomDomainCache = async (url: URL | string) => {
  await trySafe(async () => redisCache.set(getDomainGenerationKey(url), generateStandardShortId()));
  await trySafe(async () => redisCache.delete(getDomainCacheKey(url)));
};

/**
 * Get tenant ID from the custom domain URL.
 */
const getTenantIdFromCustomDomain = async (
  url: URL,
  pool: CommonQueryMethods
): Promise<string | undefined> => {
  const cachedValue = await trySafe(async () => redisCache.get(getDomainCacheKey(url)));

  if (cachedValue) {
    return cachedValue;
  }

  const generation = await trySafe(async () => redisCache.get(getDomainGenerationKey(url)));
  const isInvalidated = async () =>
    (await trySafe(async () => redisCache.get(getDomainGenerationKey(url)))) !== generation;

  const { findActiveDomain } = createDomainsQueries(pool);

  const domain = await findActiveDomain(url.hostname);

  if (!domain?.tenantId) {
    return;
  }

  /**
   * Skip the write-back when an invalidation happened while the database read was in flight,
   * since the mapping may reflect pre-mutation state.
   */
  if (await isInvalidated()) {
    return domain.tenantId;
  }

  await trySafe(async () => redisCache.set(getDomainCacheKey(url), domain.tenantId));

  /**
   * Undo the write if an invalidation landed between the check and the write, so a stale
   * mapping can never persist after {@link clearCustomDomainCache} resolves.
   */
  if (await isInvalidated()) {
    await trySafe(async () => redisCache.delete(getDomainCacheKey(url)));
  }

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
