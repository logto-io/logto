import { defaultManagementApi, defaultTenantId } from '@logto/schemas';
import { TenantTag } from '@logto/schemas/models';
import { conditionalArray, noop } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useCallback, useMemo, createContext, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { type TenantResponse as TenantInfo } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { ReservedPlanId } from '@/consts/subscriptions';

/**
 * The routes don't start with a tenant ID.
 *
 * @remarks
 * It's important to keep this single source of truth for all anonymous routes
 * because we need to check if the current route is anonymous or not to decide
 * if the current tenant ID is available.
 *
 * This should be more clear once we refactor the file structure and the routes.
 */
export enum GlobalAnonymousRoute {
  Callback = '/callback',
  SocialDemoCallback = '/social-demo-callback',
}

const anonymousRoutes: Readonly<string[]> = Object.freeze(Object.values(GlobalAnonymousRoute));

/**
 * The current tenant status of access validation. When it's `validated`, it indicates that a
 * valid Access Token for the current tenant is available.
 */
type CurrentTenantStatus = 'pending' | 'validating' | 'validated';

/** @see {@link TenantsProvider} for why `useSWR()` is not applicable for this context. */
type Tenants = {
  tenants: readonly TenantInfo[];
  /** Indicates if the tenants data is ready for the first render. */
  isInitComplete: boolean;
  /** Reset tenants to the given value. It will overwrite the current tenants data and set `isInitComplete` to `true`. */
  resetTenants: (tenants: TenantInfo[]) => void;
  /** Prepend a new tenant to the current tenants data. */
  prependTenant: (tenant: TenantInfo) => void;
  /** Remove a tenant by ID from the current tenants data. */
  removeTenant: (tenantId: string) => void;
  /** Update a tenant by ID if it exists in the current tenants data. */
  updateTenant: (tenantId: string, data: Partial<TenantInfo>) => void;
  /** The current tenant ID parsed from the URL. */
  currentTenantId: string;
  currentTenant?: TenantInfo;
  /**
   * Indicates if the Access Token has been validated for use. Will be reset to `pending` when the current tenant changes.
   *
   * @see {@link CurrentTenantStatus}
   */
  currentTenantStatus: CurrentTenantStatus;
  setCurrentTenantStatus: (status: CurrentTenantStatus) => void;
  /** Navigate to the given tenant ID. */
  navigateTenant: (tenantId: string) => void;
};

const { tenantId, indicator } = defaultManagementApi.resource;

/**
 * - For cloud, the initial tenants data is empty, and it will be fetched from the cloud API.
 * - OSS has a fixed tenant with ID `default` and no cloud API to dynamically fetch tenants.
 */
const initialTenants = Object.freeze(
  conditionalArray(
    !isCloud && {
      id: tenantId,
      name: `tenant_${tenantId}`,
      tag: TenantTag.Development,
      indicator,
      planId: `${ReservedPlanId.free}`, // `planId` is string type.
    }
  )
);

export const TenantsContext = createContext<Tenants>({
  tenants: initialTenants,
  isInitComplete: false,
  resetTenants: noop,
  prependTenant: noop,
  removeTenant: noop,
  updateTenant: noop,
  currentTenantId: '',
  currentTenantStatus: 'pending',
  setCurrentTenantStatus: noop,
  navigateTenant: noop,
});

type Props = {
  children: ReactNode;
};

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
  const match = useMatch('/:tenantId/*');
  const navigate = useNavigate();
  const currentTenantId = useMemo(() => {
    if (!isCloud) {
      return defaultTenantId;
    }

    if (!match || anonymousRoutes.includes(match.pathname)) {
      return '';
    }

    return match.params.tenantId ?? '';
  }, [match]);
  const [currentTenantStatus, setCurrentTenantStatus] = useState<CurrentTenantStatus>('pending');

  const navigateTenant = useCallback(
    (tenantId: string) => {
      navigate(`/${tenantId}`);

      setCurrentTenantStatus('pending');
    },
    [navigate]
  );

  const currentTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === currentTenantId),
    [currentTenantId, tenants]
  );

  const memorizedContext = useMemo(
    () => ({
      tenants,
      resetTenants: (tenants: TenantInfo[]) => {
        setTenants(tenants);
        setCurrentTenantStatus('pending');
        setIsInitComplete(true);
      },
      prependTenant: (tenant: TenantInfo) => {
        setTenants((tenants) => [tenant, ...tenants]);
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
      currentTenantStatus,
      setCurrentTenantStatus,
      navigateTenant,
    }),
    [currentTenant, currentTenantId, currentTenantStatus, isInitComplete, navigateTenant, tenants]
  );

  return <TenantsContext.Provider value={memorizedContext}>{children}</TenantsContext.Provider>;
}

export default TenantsProvider;
