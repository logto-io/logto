import { trySafe } from '@silverhand/essentials';
import { useCallback, useContext, useMemo, useState } from 'react';
import { z } from 'zod';

import { TenantsContext } from '@/contexts/TenantsProvider';

import useMeCustomData from './use-me-custom-data';

const key = 'defaultTenantId';

/**
 * A hook that gets the default tenant ID for the current user from user's `customData`.
 *
 * - By default, the default tenant ID is empty, which means the first tenant is the default tenant.
 * - If the default tenant ID is not available to the user anymore, it semantically equals to the first tenant ID.
 */
const useUserDefaultTenantId = () => {
  const { data, update: updateMeCustomData } = useMeCustomData();
  const { tenants, currentTenantId } = useContext(TenantsContext);
  const storedId = useMemo(
    () => trySafe(() => z.object({ [key]: z.string() }).parse(data)[key]),
    [data]
  );
  // Ensure update the same tenant ID to the stored ID only once.
  const [updatedTenantId, setUpdatedTenantId] = useState('');

  const defaultTenantId = useMemo(() => {
    // Ensure the stored ID is still available to the user.
    if (storedId && tenants.some(({ id }) => id === storedId)) {
      return storedId;
    }

    // Fall back to the first tenant ID.
    return tenants[0]?.id;
  }, [storedId, tenants]);

  const updateIfNeeded = useCallback(async () => {
    if (currentTenantId !== storedId && currentTenantId !== updatedTenantId) {
      setUpdatedTenantId(currentTenantId);
      await updateMeCustomData({
        [key]: currentTenantId,
      });
    }
  }, [currentTenantId, storedId, updateMeCustomData, updatedTenantId]);

  return useMemo(
    () => ({
      defaultTenantId,
      /** Update the default tenant ID to the current tenant ID. */
      updateIfNeeded,
    }),
    [defaultTenantId, updateIfNeeded]
  );
};

export default useUserDefaultTenantId;
