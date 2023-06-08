import { useLogto } from '@logto/react';
import { type PatchTenant, type CreateTenant, type TenantInfo } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { TenantsContext } from '@/contexts/TenantsProvider';

const useTenants = () => {
  const { signIn, getAccessToken } = useLogto();
  const cloudApi = useCloudApi();
  const { tenants, setTenants, currentTenantId, setCurrentTenantId, setIsSettle, navigate } =
    useContext(TenantsContext);
  const [error, setError] = useState<Error>();

  const tryCatch = async (exec: Parameters<typeof trySafe>[0]) =>
    trySafe(exec, (error) => {
      setError(error instanceof Error ? error : new Error(String(error)));
    });

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

  const loadTenants = useCallback(async () => {
    await tryCatch(async () => {
      const availableTenants = await cloudApi.get('/api/tenants').json<TenantInfo[]>();
      setTenants(availableTenants);
    });
  }, [cloudApi, setTenants]);

  const create = useCallback(
    async (payload: Required<Pick<CreateTenant, 'name' | 'tag'>>) => {
      await tryCatch(async () => {
        const createdTenant = await cloudApi
          .post('/api/tenants', { json: payload })
          .json<TenantInfo>();
        const newTenants = [createdTenant, ...(tenants ?? [])];
        setTenants(newTenants);
      });
    },
    [cloudApi, setTenants, tenants]
  );

  const update = useCallback(
    async (payload: Required<PatchTenant>) => {
      await tryCatch(async () => {
        const updatedTenant = await cloudApi
          .patch(`/api/tenants/${currentTenantId}`, { json: payload })
          .json<TenantInfo>();
        const index = tenants?.findIndex(({ id }) => id === currentTenantId);
        if (index !== undefined && index !== -1) {
          const updatedTenants = [
            ...(tenants ?? []).slice(0, index),
            updatedTenant,
            ...(tenants ?? []).slice(index + 1),
          ];
          setTenants(updatedTenants);
        }
      });
    },
    [cloudApi, currentTenantId, setTenants, tenants]
  );

  /** `delete` is built-in property. */
  const remove = useCallback(async () => {
    await tryCatch(async () => {
      await cloudApi.delete(`/api/tenants/${currentTenantId}`);
      const tenantsAfterDeletion = (tenants ?? []).filter(({ id }) => id !== currentTenantId);
      setTenants(tenantsAfterDeletion);
      setCurrentTenantId('');
      setIsSettle(false);
    });
  }, [cloudApi, currentTenantId, setCurrentTenantId, setIsSettle, setTenants, tenants]);

  useEffect(() => {
    if (!tenants) {
      void loadTenants();
    }
  }, [loadTenants, tenants]);

  const currentTenant = useMemo(() => {
    return tenants?.find(({ id }) => id === currentTenantId);
  }, [currentTenantId, tenants]);

  useEffect(() => {
    if (currentTenant) {
      void validate(currentTenant);
    }
    /** Fallback to the first available tenant. */
    if (tenants?.[0]) {
      setCurrentTenantId(tenants[0].id);
      navigate(tenants[0].id);
    }
  }, [currentTenant, navigate, setCurrentTenantId, tenants, validate]);

  return {
    tenants,
    currentTenantId,
    currentTenant,
    create,
    update,
    remove,
    isLoaded: Boolean(tenants && !error),
    error,
  };
};

export default useTenants;
