import { type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { createContext, useMemo, type ReactNode } from 'react';

export const SsoConnectorContext = createContext<{
  ssoConnector?: SsoConnectorWithProviderConfig;
}>({});

type Props = {
  readonly children: ReactNode;
  readonly ssoConnector: SsoConnectorWithProviderConfig;
};

function SsoConnectorContextProvider({ children, ssoConnector }: Props) {
  const contextValue = useMemo(() => ({ ssoConnector }), [ssoConnector]);

  return (
    <SsoConnectorContext.Provider value={contextValue}>{children}</SsoConnectorContext.Provider>
  );
}

export default SsoConnectorContextProvider;
