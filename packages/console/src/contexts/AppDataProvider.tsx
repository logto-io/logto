import ky from 'ky';
import type { ReactNode } from 'react';
import { useContext, useMemo, createContext } from 'react';
import useSWRImmutable from 'swr/immutable';

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
  const { currentTenantId } = useContext(TenantsContext);

  const { data: userEndpoint } = useSWRImmutable(
    `api/.well-known/endpoints/${currentTenantId}`,
    async (pathname) => {
      const { user } = await ky
        .get(new URL(pathname, adminTenantEndpoint))
        .json<{ user: string }>();
      return new URL(user);
    }
  );

  const memorizedContext = useMemo(
    () =>
      ({
        userEndpoint,
      }) satisfies AppData,
    [userEndpoint]
  );

  return <AppDataContext.Provider value={memorizedContext}>{children}</AppDataContext.Provider>;
}

export default AppDataProvider;
