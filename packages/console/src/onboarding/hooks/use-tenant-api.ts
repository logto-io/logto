import { buildOrganizationUrn } from '@logto/core-kit';
import { getTenantOrganizationId } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { type StaticApiProps, useStaticApi } from '@/hooks/use-api';

/**
 * A hook to get a Ky instance with the current tenant's Management API prefix URL. Note this hook
 * can only be used in a route with a `:tenantId` param.
 */
const useTenantApi = (props: Omit<StaticApiProps, 'prefixUrl' | 'resourceIndicator'> = {}) => {
  const { tenantId: currentTenantId } = useParams();

  if (!currentTenantId) {
    throw new Error(
      'No tenant ID param found in the current route. This hook should be used in a route with a tenant ID param.'
    );
  }

  const config = useMemo(
    () => ({
      prefixUrl: appendPath(new URL(window.location.origin), 'm', currentTenantId),
      resourceIndicator: buildOrganizationUrn(getTenantOrganizationId(currentTenantId)),
    }),
    [currentTenantId]
  );

  return useStaticApi({
    ...props,
    ...config,
  });
};

export default useTenantApi;
