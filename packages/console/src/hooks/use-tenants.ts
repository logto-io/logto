import { useLogto } from '@logto/react';
import { type TenantInfo } from '@logto/schemas/models';
import { type Optional, trySafe } from '@silverhand/essentials';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { type KeyedMutator } from 'swr';

import { useCloudSwr } from '@/cloud/hooks/use-cloud-swr';
import { TenantsContext } from '@/contexts/TenantsProvider';

type TenantsHook = {
  currentTenant?: TenantInfo;
  currentTenantId: string;
  error?: Error;
  isLoaded: boolean;
  isLoading: boolean;
  isSettle: boolean;
  mutate: KeyedMutator<TenantInfo[]>;
  setCurrentTenantId: (id: string) => void;
  tenants?: TenantInfo[];
};

const useTenants = (): TenantsHook => {
  const { signIn, getAccessToken } = useLogto();
  const { currentTenantId, setCurrentTenantId, isSettle, setIsSettle } = useContext(TenantsContext);
  const { data: availableTenants, error, mutate } = useCloudSwr('/api/tenants');
  const isLoading = !availableTenants && !error;
  const isLoaded = Boolean(availableTenants && !error);

  const validate = useCallback(
    async (tenant: TenantInfo) => {
      const { id, indicator } = tenant;
      if (await trySafe(getAccessToken(indicator))) {
        setIsSettle(true);
      } else {
        void signIn(new URL(`/${id}/callback`, window.location.origin).toString());
      }
    },
    [getAccessToken, setIsSettle, signIn]
  );

  const currentTenant: Optional<TenantInfo> = useMemo(() => {
    return availableTenants?.find(({ id }) => id === currentTenantId);
  }, [currentTenantId, availableTenants]);

  useEffect(() => {
    if (currentTenant) {
      void validate(currentTenant);
    }
  }, [currentTenant, validate]);

  return {
    currentTenant,
    currentTenantId,
    error,
    isLoaded,
    isLoading,
    isSettle,
    mutate,
    setCurrentTenantId, // Will be used to switch to another tenant.
    tenants: availableTenants,
  };
};

export default useTenants;
