import ky from 'ky';
import type { ReactNode } from 'react';
import { useMemo, useEffect, createContext, useState } from 'react';

import { adminTenantEndpoint, getUserTenantId } from '@/consts';

type Props = {
  children: ReactNode;
};

export type AppEndpoints = {
  userEndpoint?: URL;
  adminEndpoint?: URL;
};

export type AppEndpointKey = keyof AppEndpoints;

export const AppEndpointsContext = createContext<AppEndpoints>({});

const AppEndpointsProvider = ({ children }: Props) => {
  const [endpoints, setEndpoints] = useState<AppEndpoints>({});
  const memorizedContext = useMemo(() => endpoints, [endpoints]);

  useEffect(() => {
    const getEndpoint = async () => {
      const tenantId = getUserTenantId();

      if (!tenantId) {
        return;
      }

      const { user } = await ky
        .get(new URL(`api/.well-known/endpoints/${tenantId}`, adminTenantEndpoint))
        .json<{ user: string }>();
      setEndpoints({ userEndpoint: new URL(user) });
    };

    void getEndpoint();
  }, []);

  return (
    <AppEndpointsContext.Provider value={memorizedContext}>{children}</AppEndpointsContext.Provider>
  );
};

export default AppEndpointsProvider;
