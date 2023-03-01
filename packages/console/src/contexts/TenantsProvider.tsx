import type { TenantInfo } from '@logto/schemas';
import { defaultManagementApi } from '@logto/schemas';
import { conditional, noop } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useMemo, createContext, useState } from 'react';

import { isCloud } from '@/consts/cloud';

type Props = {
  children: ReactNode;
};

export type Tenants = {
  tenants?: TenantInfo[];
  isSettle: boolean;
  setTenants: (tenants: TenantInfo[]) => void;
  setIsSettle: (isSettle: boolean) => void;
};

const { tenantId, indicator } = defaultManagementApi.resource;
const initialTenants = conditional(!isCloud && [{ id: tenantId, indicator }]);

export const TenantsContext = createContext<Tenants>({
  tenants: initialTenants,
  setTenants: noop,
  isSettle: false,
  setIsSettle: noop,
});

const TenantsProvider = ({ children }: Props) => {
  const [tenants, setTenants] = useState(initialTenants);
  const [isSettle, setIsSettle] = useState(false);
  const memorizedContext = useMemo(
    () => ({ tenants, setTenants, isSettle, setIsSettle }),
    [isSettle, tenants]
  );

  return <TenantsContext.Provider value={memorizedContext}>{children}</TenantsContext.Provider>;
};

export default TenantsProvider;
