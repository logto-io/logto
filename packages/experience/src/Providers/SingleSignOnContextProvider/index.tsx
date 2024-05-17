import { type SsoConnectorMetadata } from '@logto/schemas';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import { useSieMethods } from '@/hooks/use-sie';

import SingleSignOnContext, { type SingleSignOnContextType } from './SingleSignOnContext';

type Props = {
  readonly children: ReactNode;
};

const SingleSignOnContextProvider = ({ children }: Props) => {
  const { ssoConnectors } = useSieMethods();
  const { get, set, remove } = useSessionStorage();
  const [email, setEmail] = useState<string | undefined>(get(StorageKeys.SsoEmail));
  const [domainFilteredConnectors, setDomainFilteredConnectors] = useState<SsoConnectorMetadata[]>(
    get(StorageKeys.SsoConnectors) ?? []
  );

  useEffect(() => {
    if (!email) {
      remove(StorageKeys.SsoEmail);
      return;
    }

    set(StorageKeys.SsoEmail, email);
  }, [email, remove, set]);

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

  const singleSignOnContext = useMemo<SingleSignOnContextType>(
    () => ({
      email,
      setEmail,
      availableSsoConnectorsMap: ssoConnectorsMap,
      ssoConnectors: domainFilteredConnectors,
      setSsoConnectors: setDomainFilteredConnectors,
    }),
    [domainFilteredConnectors, email, ssoConnectorsMap]
  );

  return (
    <SingleSignOnContext.Provider value={singleSignOnContext}>
      {children}
    </SingleSignOnContext.Provider>
  );
};

export default SingleSignOnContextProvider;
