import { type SsoConnectorMetadata } from '@logto/schemas';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import { useSieMethods } from '@/hooks/use-sie';

import UserInteractionContext, { type UserInteractionContextType } from './UserInteractionContext';

type Props = {
  readonly children: ReactNode;
};

/**
 * UserInteractionContextProvider
 *
 * This component manages user interaction data during the sign-in process,
 * combining React's Context API with session storage to enable cross-page
 * data persistence and access.
 *
 * The cached data provided by this provider primarily helps improve the sign-in experience for end users.
 */
const UserInteractionContextProvider = ({ children }: Props) => {
  const { ssoConnectors } = useSieMethods();
  const { get, set, remove } = useSessionStorage();
  const [ssoEmail, setSsoEmail] = useState<string | undefined>(get(StorageKeys.SsoEmail));
  const [domainFilteredConnectors, setDomainFilteredConnectors] = useState<SsoConnectorMetadata[]>(
    get(StorageKeys.SsoConnectors) ?? []
  );

  useEffect(() => {
    if (!ssoEmail) {
      remove(StorageKeys.SsoEmail);
      return;
    }

    set(StorageKeys.SsoEmail, ssoEmail);
  }, [ssoEmail, remove, set]);

  useEffect(() => {
    if (domainFilteredConnectors.length === 0) {
      remove(StorageKeys.SsoConnectors);
      return;
    }

    set(StorageKeys.SsoConnectors, domainFilteredConnectors);
  }, [domainFilteredConnectors, remove, set]);

  const ssoConnectorsMap = useMemo(
    () => new Map(ssoConnectors.map((connector) => [connector.id, connector])),
    [ssoConnectors]
  );

  const userInteractionContext = useMemo<UserInteractionContextType>(
    () => ({
      ssoEmail,
      setSsoEmail,
      availableSsoConnectorsMap: ssoConnectorsMap,
      ssoConnectors: domainFilteredConnectors,
      setSsoConnectors: setDomainFilteredConnectors,
    }),
    [ssoEmail, ssoConnectorsMap, domainFilteredConnectors]
  );

  return (
    <UserInteractionContext.Provider value={userInteractionContext}>
      {children}
    </UserInteractionContext.Provider>
  );
};

export default UserInteractionContextProvider;
