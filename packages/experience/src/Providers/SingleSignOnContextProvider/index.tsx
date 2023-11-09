import { type SsoConnectorMetadata } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useSieMethods } from '@/hooks/use-sie';

import SingleSignOnContext, { type SingleSignOnContextType } from './SingleSignOnContext';

const SingleSignOnContextProvider = () => {
  const { ssoConnectors } = useSieMethods();
  const [email, setEmail] = useState<string | undefined>();
  const [domainFilteredConnectors, setDomainFilteredConnectors] = useState<SsoConnectorMetadata[]>(
    []
  );
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
      <Outlet />
    </SingleSignOnContext.Provider>
  );
};

export default SingleSignOnContextProvider;
