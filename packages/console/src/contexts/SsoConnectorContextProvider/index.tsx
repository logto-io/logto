import { type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { createContext, useMemo, type ReactNode } from 'react';

export type SsoGuideData = Pick<
  SsoConnectorWithProviderConfig,
  'id' | 'providerName' | 'providerConfig'
>;

export const SsoConnectorContext = createContext<{
  ssoConnector?: SsoGuideData;
  redirectUri?: string;
  isGlobal?: boolean;
}>({});

type Props = {
  readonly children: ReactNode;
  readonly ssoConnector: SsoGuideData;
  readonly redirectUri?: string;
  readonly isGlobal?: boolean;
};

function SsoConnectorContextProvider({ children, ssoConnector, redirectUri, isGlobal }: Props) {
  const contextValue = useMemo(
    () => ({ ssoConnector, redirectUri, isGlobal }),
    [ssoConnector, redirectUri, isGlobal]
  );

  return (
    <SsoConnectorContext.Provider value={contextValue}>{children}</SsoConnectorContext.Provider>
  );
}

export default SsoConnectorContextProvider;
