import { trySafe } from '@silverhand/essentials';
import { useCallback, useContext, useMemo } from 'react';
import { z } from 'zod';

import { TenantsContext } from '@/contexts/TenantsProvider';

import useMeCustomData from './use-me-custom-data';

const key = 'defaultTenantId';

/**
 * A hook that gets the default tenant ID for the current user from user's `customData`.
 *
 * - By default, the default tenant ID is empty, which means the first tenant is the default tenant.
 * - If the default tenant ID is not available to the user anymore, it semantically equals to the first tenant ID.
 * - If the user manually navigates to a tenant, the default tenant ID will be set to the target tenant ID.
 */
const useUserDefaultTenantId = () => {
  const { data, update: updateMeCustomData } = useMeCustomData();
  const { tenants, currentTenantId } = useContext(TenantsContext);

  const defaultTenantId = useMemo(() => {
    const storedId = trySafe(() => z.object({ [key]: z.string() }).parse(data)[key]);

    // Ensure the stored ID is still available to the user.
    if (storedId && tenants.some(({ id }) => id === storedId)) {
      return storedId;
    }

    // Fall back to the first tenant ID.
    return tenants[0]?.id;
  }, [data, tenants]);

  const updateIfNeeded = useCallback(async () => {
    if (currentTenantId !== defaultTenantId) {
      await updateMeCustomData({
        [key]: currentTenantId,
      });
    }
  }, [currentTenantId, defaultTenantId, updateMeCustomData]);

  return {
    defaultTenantId,
    /**
     * Update the default tenant ID to the current tenant ID if:
     *
     * 1. The current tenant ID is not empty.
     * 2. The default tenant ID does not equal to the current tenant ID.
     */
    updateIfNeeded,
  };
};

export default useUserDefaultTenantId;
