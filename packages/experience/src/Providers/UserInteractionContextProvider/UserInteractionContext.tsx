import { type SsoConnectorMetadata } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

export type UserInteractionContextType = {
  // All the enabled sso connectors
  availableSsoConnectorsMap: Map<string, SsoConnectorMetadata>;
  ssoEmail?: string;
  setSsoEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
  // The sso connectors that are enabled for the current domain
  ssoConnectors: SsoConnectorMetadata[];
  setSsoConnectors: React.Dispatch<React.SetStateAction<SsoConnectorMetadata[]>>;
};

export default createContext<UserInteractionContextType>({
  ssoEmail: undefined,
  availableSsoConnectorsMap: new Map(),
  ssoConnectors: [],
  setSsoEmail: noop,
  setSsoConnectors: noop,
});
