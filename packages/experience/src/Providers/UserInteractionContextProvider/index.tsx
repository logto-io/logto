import { type SsoConnectorMetadata } from '@logto/schemas';
import { type ReactNode, useEffect, useMemo, useState, useCallback } from 'react';

import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import { useSieMethods } from '@/hooks/use-sie';
import { type CurrentIdentifierSession } from '@/types/guard';

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
  const [currentIdentifier, setCurrentIdentifier] = useState<CurrentIdentifierSession | undefined>(
    get(StorageKeys.CurrentIdentifier)
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

  useEffect(() => {
    if (!currentIdentifier) {
      remove(StorageKeys.CurrentIdentifier);
      return;
    }

    set(StorageKeys.CurrentIdentifier, currentIdentifier);
  }, [currentIdentifier, remove, set]);

  const ssoConnectorsMap = useMemo(
    () => new Map(ssoConnectors.map((connector) => [connector.id, connector])),
    [ssoConnectors]
  );

  const clearUserInteractionSession = useCallback(() => {
    setSsoEmail(undefined);
    setDomainFilteredConnectors([]);
    setCurrentIdentifier(undefined);
  }, []);

  const userInteractionContext = useMemo<UserInteractionContextType>(
    () => ({
      ssoEmail,
      setSsoEmail,
      availableSsoConnectorsMap: ssoConnectorsMap,
      ssoConnectors: domainFilteredConnectors,
      setSsoConnectors: setDomainFilteredConnectors,
      currentIdentifier,
      setCurrentIdentifier,
      clearUserInteractionSession,
    }),
    [
      ssoEmail,
      ssoConnectorsMap,
      domainFilteredConnectors,
      currentIdentifier,
      clearUserInteractionSession,
    ]
  );

  return (
    <UserInteractionContext.Provider value={userInteractionContext}>
      {children}
    </UserInteractionContext.Provider>
  );
};

export default UserInteractionContextProvider;
