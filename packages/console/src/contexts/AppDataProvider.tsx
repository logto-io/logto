import ky from 'ky';
import type { ReactNode } from 'react';
import { useContext, useMemo, useEffect, createContext, useState } from 'react';

import { adminTenantEndpoint } from '@/consts';

import { TenantsContext } from './TenantsProvider';

type Props = {
  children: ReactNode;
};

type AppData = {
  /**
   * The Logto endpoint for the current tenant.
   *
   * Always use this value as the base URL when referring to the Logto URL of the current user's tenant.
   */
  userEndpoint?: URL;
};

export const AppDataContext = createContext<AppData>({});

/** The context provider for the global app data. */
function AppDataProvider({ children }: Props) {
  const [userEndpoint, setUserEndpoint] = useState<URL>();
  const { currentTenantId } = useContext(TenantsContext);
  const memorizedContext = useMemo(
    () =>
      ({
        userEndpoint,
      } satisfies AppData),
    [userEndpoint]
  );

  useEffect(() => {
    const getEndpoint = async () => {
      if (!currentTenantId) {
        return;
      }

      const { user } = await ky
        .get(new URL(`api/.well-known/endpoints/${currentTenantId}`, adminTenantEndpoint))
        .json<{ user: string }>();
      setUserEndpoint(new URL(user));
    };

    void getEndpoint();
  }, [currentTenantId]);

  return <AppDataContext.Provider value={memorizedContext}>{children}</AppDataContext.Provider>;
}

export default AppDataProvider;
