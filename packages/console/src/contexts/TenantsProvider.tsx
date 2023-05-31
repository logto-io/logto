import { type TenantInfo, TenantTag, defaultManagementApi } from '@logto/schemas';
import { conditional, noop } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useCallback, useMemo, createContext, useState } from 'react';
import type { NavigateOptions } from 'react-router-dom';

import { isCloud } from '@/consts/env';
import { getUserTenantId } from '@/consts/tenants';

type Props = {
  children: ReactNode;
};

type Tenants = {
  tenants?: TenantInfo[];
  isSettle: boolean;
  setTenants: (tenants: TenantInfo[]) => void;
  setIsSettle: (isSettle: boolean) => void;
  currentTenantId: string;
  setCurrentTenantId: (tenantId: string) => void;
  navigate: (tenantId: string, options?: NavigateOptions) => void;
};

const { tenantId, indicator } = defaultManagementApi.resource;
const initialTenants = conditional(
  !isCloud && [
    { id: tenantId, name: `tenant_${tenantId}`, tag: `${TenantTag.Development}`, indicator }, // Make `tag` value to be string type.
  ]
);

export const TenantsContext = createContext<Tenants>({
  tenants: initialTenants,
  setTenants: noop,
  isSettle: false,
  setIsSettle: noop,
  currentTenantId: '',
  setCurrentTenantId: noop,
  navigate: noop,
});

function TenantsProvider({ children }: Props) {
  const [tenants, setTenants] = useState(initialTenants);
  const [isSettle, setIsSettle] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState(getUserTenantId());

  const navigate = useCallback((tenantId: string, options?: NavigateOptions) => {
    if (options?.replace) {
      window.history.replaceState(options.state ?? {}, '', '/' + tenantId);

      return;
    }
    window.history.pushState(options?.state ?? {}, '', '/' + tenantId);
    setCurrentTenantId(tenantId);
  }, []);

  const memorizedContext = useMemo(
    () => ({
      tenants,
      setTenants,
      isSettle,
      setIsSettle,
      currentTenantId,
      setCurrentTenantId,
      navigate,
    }),
    [currentTenantId, isSettle, navigate, tenants]
  );

  return <TenantsContext.Provider value={memorizedContext}>{children}</TenantsContext.Provider>;
}

export default TenantsProvider;
