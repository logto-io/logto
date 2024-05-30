import ky from 'ky';
import type { ReactNode } from 'react';
import { useContext, useMemo, createContext } from 'react';
import useSWRImmutable from 'swr/immutable';

import { adminTenantEndpoint } from '@/consts';

import { TenantsContext } from './TenantsProvider';

type Props = {
  readonly children: ReactNode;
};

type AppData = {
  /**
   * The Logto endpoint for the current tenant.
   *
   * Always use this value as the base URL when referring to the Logto URL of the current user's tenant.
   */
  tenantEndpoint?: URL;
};

export const AppDataContext = createContext<AppData>({});

export const useTenantEndpoint = (tenantId: string) => {
  return useSWRImmutable(`api/.well-known/endpoints/${tenantId}`, async (pathname) => {
    const { user } = await ky.get(new URL(pathname, adminTenantEndpoint)).json<{ user: string }>();
    return new URL(user);
  });
};

/** The context provider for the global app data. */
function AppDataProvider({ children }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: tenantEndpoint } = useTenantEndpoint(currentTenantId);
  const memorizedContext = useMemo(
    () =>
      ({
        tenantEndpoint,
      }) satisfies AppData,
    [tenantEndpoint]
  );

  return <AppDataContext.Provider value={memorizedContext}>{children}</AppDataContext.Provider>;
}

export default AppDataProvider;
