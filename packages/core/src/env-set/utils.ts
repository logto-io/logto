import path from 'node:path';

import { adminTenantId, defaultTenantId } from '@logto/schemas';
import type { GlobalValues } from '@logto/shared';
import type { Optional } from '@silverhand/essentials';
import { deduplicate, trySafe } from '@silverhand/essentials';

export const getTenantEndpoint = (
  id: string,
  { urlSet, adminUrlSet, isDomainBasedMultiTenancy, isPathBasedMultiTenancy }: GlobalValues
): URL => {
  const adminUrl = trySafe(() => adminUrlSet.endpoint);

  if (adminUrl && id === adminTenantId) {
    return adminUrl;
  }

  if (isPathBasedMultiTenancy) {
    return new URL(path.join(urlSet.endpoint.pathname, id), urlSet.endpoint);
  }

  if (!isDomainBasedMultiTenancy) {
    return urlSet.endpoint;
  }

  // The default tenant lives on the bare host (`*.host` -> `host`), so existing issuers stay unchanged.
  if (id === defaultTenantId && urlSet.endpoint.hostname.startsWith('*.')) {
    return getBareEndpoint(urlSet.endpoint);
  }

  const tenantUrl = new URL(urlSet.endpoint);
  // eslint-disable-next-line @silverhand/fp/no-mutation
  tenantUrl.hostname = tenantUrl.hostname.replace('*', id);

  return tenantUrl;
};

/** The bare host of a domain-based endpoint: `https://*.host` becomes `https://host`. */
export const getBareEndpoint = (endpoint: URL): URL => {
  const bare = new URL(endpoint);
  // eslint-disable-next-line @silverhand/fp/no-mutation
  bare.hostname = bare.hostname.replace(/^\*\./, '');

  return bare;
};

const getTenantLocalhost = (
  id: string,
  { urlSet, adminUrlSet, isDomainBasedMultiTenancy, isPathBasedMultiTenancy }: GlobalValues
): Optional<URL> => {
  const adminUrl = trySafe(() => adminUrlSet.localhostUrl);

  if (adminUrl && id === adminTenantId) {
    return adminUrl;
  }

  const localhost = trySafe(() => urlSet.localhostUrl);

  if (isPathBasedMultiTenancy && localhost) {
    return new URL(path.join(localhost.pathname, id), localhost);
  }

  if (!isDomainBasedMultiTenancy) {
    return localhost;
  }
};

export const getTenantUrls = (
  id: string,
  globalValues: GlobalValues,
  runtimeEndpoint?: URL
): URL[] => {
  const endpoint = getTenantEndpoint(id, globalValues);
  const localhost = getTenantLocalhost(id, globalValues);

  return deduplicate(
    [runtimeEndpoint?.toString(), endpoint.toString(), localhost?.toString()].filter(
      (value): value is string => typeof value === 'string'
    )
  ).map((element) => new URL(element));
};
