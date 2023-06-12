import { useLogto } from '@logto/react';
import { type TenantInfo } from '@logto/schemas/models';
import { type Optional, trySafe } from '@silverhand/essentials';
import type ky from 'ky';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { TenantsContext } from '@/contexts/TenantsProvider';

import useSwrFetcher from './use-swr-fetcher';

type KyInstance = typeof ky;

type TenantsHook = {
  api: KyInstance;
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
  const cloudApi = useCloudApi();
  const { signIn, getAccessToken } = useLogto();
  const { currentTenantId, setCurrentTenantId, isSettle, setIsSettle } = useContext(TenantsContext);

  const fetcher = useSwrFetcher<TenantInfo[]>(cloudApi);
  const {
    data: availableTenants,
    error,
    mutate,
  } = useSWR<TenantInfo[], Error>('/api/tenants', fetcher);
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
    api: cloudApi,
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
