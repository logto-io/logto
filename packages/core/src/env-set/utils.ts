import { adminTenantId } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

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
