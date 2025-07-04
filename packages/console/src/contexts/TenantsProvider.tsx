import { defaultTenantId, TenantTag } from '@logto/schemas';
import { conditionalArray, noop } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useCallback, useMemo, createContext, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { type TenantResponse } from '@/cloud/types/router';
import { defaultTenantResponse } from '@/consts';
import { isCloud } from '@/consts/env';

/**
 * The reserved routes that don't require authentication.
 */
export enum GlobalAnonymousRoute {
  /** The global callback route for OpenID Connect. */
  Callback = '/callback',
  SocialDemoCallback = '/social-demo-callback',
  /** The one-time token landing page. */
  OneTimeTokenLanding = '/one-time-token',
  /** The global auth status checker route for iframe usage. */
  AuthStatus = '/auth-status',
}

/**
 * The reserved routes that require authentication. Note they may not require the user to be in a
 * tenant context.
 */
export enum GlobalRoute {
  CheckoutSuccessCallback = '/checkout-success-callback',
  Onboarding = '/onboarding',
  AcceptInvitation = '/accept',
  Profile = '/profile',
  HandleSocial = '/handle-social',
}

const reservedRoutes: Readonly<string[]> = Object.freeze([
  ...Object.values(GlobalAnonymousRoute),
  ...Object.values(GlobalRoute),
]);

/**
 * The reserved tenant ID wildcard for the last-visited tenant. Useful when specifying a console URL in
 * the documentation or other places where the actual user tenant ID is unknown. The wildcard value "to"
 * will be replaced by the detected last-visited tenant ID in the runtime.
 *
 * @example
 * ```md
 * [Console > Applications](https://cloud.logto.io/to/applications)
 * ```
 */
export const reservedTenantIdWildcard = 'to';

/** @see {@link TenantsProvider} for why `useSWR()` is not applicable for this context. */
type Tenants = {
  tenants: readonly TenantResponse[];
  /** Indicates if the tenants data is ready for the first render. */
  isInitComplete: boolean;
  /** Reset tenants to the given value. It will overwrite the current tenants data and set `isInitComplete` to `true`. */
  resetTenants: (tenants: TenantResponse[]) => void;
  /** Prepend a new tenant to the current tenants data. */
  prependTenant: (tenant: TenantResponse) => void;
  /** Remove a tenant by ID from the current tenants data. */
  removeTenant: (tenantId: string) => void;
  /** Update a tenant by ID if it exists in the current tenants data. */
  updateTenant: (tenantId: string, data: Partial<TenantResponse>) => void;
  /** The current tenant ID parsed from the URL. */
  currentTenantId: string;
  currentTenant?: TenantResponse;
  isDevTenant: boolean;
  /** Navigate to the given tenant ID. */
  navigateTenant: (tenantId: string) => void;
};

const initialTenants = Object.freeze(conditionalArray(!isCloud && defaultTenantResponse));

export const TenantsContext = createContext<Tenants>({
  tenants: initialTenants,
  isInitComplete: false,
  resetTenants: noop,
  prependTenant: noop,
  removeTenant: noop,
  updateTenant: noop,
  currentTenantId: '',
  isDevTenant: false,
  navigateTenant: noop,
});

type Props = {
  readonly children: ReactNode;
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

    if (
      !match ||
      reservedRoutes.some(
        (route) => match.pathname === route || match.pathname.startsWith(route + '/')
      )
    ) {
      return '';
    }

    return match.params.tenantId ?? '';
  }, [match]);

  const navigateTenant = useCallback(
    (tenantId: string) => {
      navigate(`/${tenantId}`);
    },
    [navigate]
  );

  const currentTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === currentTenantId),
    [currentTenantId, tenants]
  );

  const resetTenants = useCallback((tenants: TenantResponse[]) => {
    setTenants(tenants);
    setIsInitComplete(true);
  }, []);

  const prependTenant = useCallback((tenant: TenantResponse) => {
    setTenants((tenants) => [tenant, ...tenants]);
  }, []);

  const removeTenant = useCallback((tenantId: string) => {
    setTenants((tenants) => tenants.filter((tenant) => tenant.id !== tenantId));
  }, []);

  const updateTenant = useCallback((tenantId: string, data: Partial<TenantResponse>) => {
    setTenants((tenants) =>
      tenants.map((tenant) => (tenant.id === tenantId ? { ...tenant, ...data } : tenant))
    );
  }, []);

  const memorizedContext = useMemo(
    () => ({
      tenants,
      resetTenants,
      prependTenant,
      removeTenant,
      updateTenant,
      isInitComplete,
      currentTenantId,
      isDevTenant: currentTenant?.tag === TenantTag.Development,
      currentTenant,
      navigateTenant,
    }),
    [
      currentTenant,
      currentTenantId,
      isInitComplete,
      navigateTenant,
      tenants,
      resetTenants,
      prependTenant,
      removeTenant,
      updateTenant,
    ]
  );

  return <TenantsContext.Provider value={memorizedContext}>{children}</TenantsContext.Provider>;
}

export default TenantsProvider;
