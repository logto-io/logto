import { type SsoConnectorMetadata } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

export type SingleSignOnContextType = {
  // All the enabled sso connectors
  availableSsoConnectorsMap: Map<string, SsoConnectorMetadata>;
  email?: string;
  setEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
  // The sso connectors that are enabled for the current domain
  ssoConnectors: SsoConnectorMetadata[];
  setSsoConnectors: React.Dispatch<React.SetStateAction<SsoConnectorMetadata[]>>;
};

export default createContext<SingleSignOnContextType>({
  email: undefined,
  availableSsoConnectorsMap: new Map(),
  ssoConnectors: [],
  setEmail: noop,
  setSsoConnectors: noop,
});
