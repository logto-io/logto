import { adminTenantId } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { deduplicate, trySafe } from '@silverhand/essentials';

import type GlobalValues from './GlobalValues.js';

export const getTenantEndpoint = (
  id: string,
  { urlSet, adminUrlSet, isDomainBasedMultiTenancy }: GlobalValues
): URL => {
  const adminUrl = trySafe(() => adminUrlSet.endpoint);

  if (adminUrl && id === adminTenantId) {
    return adminUrl;
  }

  if (!isDomainBasedMultiTenancy) {
    return urlSet.endpoint;
  }

  const tenantUrl = new URL(urlSet.endpoint);
  // eslint-disable-next-line @silverhand/fp/no-mutation
  tenantUrl.hostname = tenantUrl.hostname.replace('*', id);

  return tenantUrl;
};

export const getTenantLocalhost = (
  id: string,
  { urlSet, adminUrlSet, isDomainBasedMultiTenancy }: GlobalValues
): Optional<URL> => {
  const adminUrl = trySafe(() => adminUrlSet.localhostUrl);

  if (adminUrl && id === adminTenantId) {
    return adminUrl;
  }

  if (!isDomainBasedMultiTenancy) {
    return trySafe(() => urlSet.localhostUrl);
  }
};

export const getTenantUrls = (id: string, globalValues: GlobalValues): URL[] => {
  const endpoint = getTenantEndpoint(id, globalValues);
  const localhost = getTenantLocalhost(id, globalValues);

  return deduplicate(
    [endpoint.toString(), localhost?.toString()].filter(
      (value): value is string => typeof value === 'string'
    )
  ).map((element) => new URL(element));
};
