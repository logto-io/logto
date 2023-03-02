import ky from 'ky';
import type { ReactNode } from 'react';
import { useContext, useMemo, useEffect, createContext, useState } from 'react';

import { adminTenantEndpoint } from '@/consts';

import { TenantsContext } from './TenantsProvider';

type Props = {
  children: ReactNode;
};

export type AppEndpoints = {
  userEndpoint?: URL;
  adminEndpoint?: URL;
};

export const AppEndpointsContext = createContext<AppEndpoints>({});

const AppEndpointsProvider = ({ children }: Props) => {
  const [endpoints, setEndpoints] = useState<AppEndpoints>({});
  const { currentTenantId } = useContext(TenantsContext);
  const memorizedContext = useMemo(() => endpoints, [endpoints]);

  useEffect(() => {
    const getEndpoint = async () => {
      if (!currentTenantId) {
        return;
      }

      const { user } = await ky
        .get(new URL(`api/.well-known/endpoints/${currentTenantId}`, adminTenantEndpoint))
        .json<{ user: string }>();
      setEndpoints({ userEndpoint: new URL(user) });
    };

    void getEndpoint();
  }, [currentTenantId]);

  return (
    <AppEndpointsContext.Provider value={memorizedContext}>{children}</AppEndpointsContext.Provider>
  );
};

export default AppEndpointsProvider;
