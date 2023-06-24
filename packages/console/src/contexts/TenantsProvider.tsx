import { defaultManagementApi } from '@logto/schemas';
import { type TenantInfo, TenantTag } from '@logto/schemas/models';
import { conditionalArray, noop } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useCallback, useMemo, createContext, useState } from 'react';
import type { NavigateOptions } from 'react-router-dom';

import { isCloud } from '@/consts/env';
import { getUserTenantId } from '@/consts/tenants';

type Props = {
  children: ReactNode;
};

/** @see {@link TenantsProvider} for why `useSWR()` is not applicable for this context. */
type Tenants = {
  tenants: readonly TenantInfo[];
  /** Indicates if the tenants data is ready for the first render. */
  isInitComplete: boolean;
  /** Reset tenants to the given value. It will overwrite the current tenants data and set `isInitComplete` to `true`. */
  resetTenants: (tenants: TenantInfo[]) => void;
  /** Append a new tenant to the current tenants data. */
  appendTenant: (tenant: TenantInfo) => void;
  /** Remove a tenant by ID from the current tenants data. */
  removeTenant: (tenantId: string) => void;
  /** Update a tenant by ID if it exists in the current tenants data. */
  updateTenant: (tenantId: string, data: Partial<TenantInfo>) => void;
  /**
   * The current tenant ID that the URL is pointing to. It is navigated programmatically
   * since there's [no easy way](https://stackoverflow.com/questions/34999976/detect-changes-on-the-url)
   * to listen to the URL change without polling.
   */
  currentTenantId: string;
  currentTenant?: TenantInfo;
  /** Indicates if the Access Token has been validated for use. Will be reset to false when the current tenant changes. */
  currentTenantValidated: boolean;
  setCurrentTenantValidated: () => void;
  navigateTenant: (tenantId: string, options?: NavigateOptions) => void;
};

const { tenantId, indicator } = defaultManagementApi.resource;

/**
 * - For cloud, the initial tenants data is empty, and it will be fetched from the cloud API.
 * - OSS has a fixed tenant with ID `default` and no cloud API to dynamically fetch tenants.
 */
const initialTenants = Object.freeze(
  conditionalArray(
    !isCloud && { id: tenantId, name: `tenant_${tenantId}`, tag: TenantTag.Development, indicator }
  )
);

export const TenantsContext = createContext<Tenants>({
  tenants: initialTenants,
  isInitComplete: false,
  resetTenants: noop,
  appendTenant: noop,
  removeTenant: noop,
  updateTenant: noop,
  currentTenantId: '',
  currentTenantValidated: false,
  setCurrentTenantValidated: noop,
  navigateTenant: noop,
});

/**
 * The global tenants context provider for all available tenants of the current users.
 * It is used to manage the tenants information, including create, update, and delete;
 * also for navigating between tenants.
 *
 * Note it is not practical to use `useSWR()` for tenants context, since fetching tenants
 * requires authentication, and the authentication is managed by the `LogtoProvider` which
 * depends and locates inside the `TenantsProvider`. Thus the fetching tenants action should
 * be done by a component inside the `LogtoProvider`, which `useSWR()` cannot handle.
 */
function TenantsProvider({ children }: Props) {
  const [tenants, setTenants] = useState(initialTenants);
  /** @see {@link initialTenants} */
  const [isInitComplete, setIsInitComplete] = useState(!isCloud);
  const [currentTenantId, setCurrentTenantId] = useState(getUserTenantId());
  const [currentTenantValidated, setCurrentTenantValidated] = useState(false);

  const navigateTenant = useCallback((tenantId: string) => {
    // Use `window.open()` to force page reload since we use `basename` for the router
    // which will not re-create the router instance when the URL changes.
    window.open(`/${tenantId}`, '_self');
    setCurrentTenantId(tenantId);
    setCurrentTenantValidated(false);
  }, []);

  const currentTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === currentTenantId),
    [currentTenantId, tenants]
  );

  const memorizedContext = useMemo(
    () => ({
      tenants,
      resetTenants: (tenants: TenantInfo[]) => {
        setTenants(tenants);
        setCurrentTenantValidated(false);
        setIsInitComplete(true);
      },
      appendTenant: (tenant: TenantInfo) => {
        setTenants((tenants) => [...tenants, tenant]);
      },
      removeTenant: (tenantId: string) => {
        setTenants((tenants) => tenants.filter((tenant) => tenant.id !== tenantId));
      },
      updateTenant: (tenantId: string, data: Partial<TenantInfo>) => {
        setTenants((tenants) =>
          tenants.map((tenant) => (tenant.id === tenantId ? { ...tenant, ...data } : tenant))
        );
      },
      isInitComplete,
      currentTenantId,
      currentTenant,
      currentTenantValidated,
      setCurrentTenantValidated: () => {
        setCurrentTenantValidated(true);
      },
      navigateTenant,
    }),
    [
      currentTenant,
      currentTenantId,
      currentTenantValidated,
      isInitComplete,
      navigateTenant,
      tenants,
    ]
  );

  return <TenantsContext.Provider value={memorizedContext}>{children}</TenantsContext.Provider>;
}

export default TenantsProvider;
