import { type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { createContext, useMemo, type ReactNode } from 'react';

import { type ConsoleSsoConnector } from '@/cloud/types/router';

export const SsoConnectorContext = createContext<{
  ssoConnector?: SsoConnectorWithProviderConfig;
  /**
   * Set when the guide is rendered for a Console SSO connector. Its service provider endpoints
   * are fixed by Logto Cloud, and its email domains require DNS ownership verification.
   */
  consoleSsoConnector?: ConsoleSsoConnector;
}>({});

type Props = {
  readonly children: ReactNode;
  readonly ssoConnector?: SsoConnectorWithProviderConfig;
  readonly consoleSsoConnector?: ConsoleSsoConnector;
};

function SsoConnectorContextProvider({ children, ssoConnector, consoleSsoConnector }: Props) {
  const contextValue = useMemo(
    () => ({ ssoConnector, consoleSsoConnector }),
    [ssoConnector, consoleSsoConnector]
  );

  return (
    <SsoConnectorContext.Provider value={contextValue}>{children}</SsoConnectorContext.Provider>
  );
}

export default SsoConnectorContextProvider;
