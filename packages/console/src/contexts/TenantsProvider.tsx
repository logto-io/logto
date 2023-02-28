import type { TenantInfo } from '@logto/schemas';
import { defaultManagementApi } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useMemo, createContext, useState } from 'react';

import { isCloud } from '@/consts/cloud';

type Props = {
  children: ReactNode;
};

type Payload = { data?: TenantInfo[]; isSettle: boolean };

export type Tenants = {
  tenants: Payload;
  setTenants: (payload: Payload) => void;
};

const { tenantId, indicator } = defaultManagementApi.resource;
const initialPayload: Payload = {
  data: conditional(!isCloud && [{ id: tenantId, indicator }]),
  isSettle: true,
};

export const TenantsContext = createContext<Tenants>({
  tenants: initialPayload,
  setTenants: () => {
    throw new Error('Not implemented');
  },
});

const TenantsProvider = ({ children }: Props) => {
  const [tenants, setTenants] = useState(initialPayload);
  const memorizedContext = useMemo(() => ({ tenants, setTenants }), [tenants]);

  return <TenantsContext.Provider value={memorizedContext}>{children}</TenantsContext.Provider>;
};

export default TenantsProvider;
