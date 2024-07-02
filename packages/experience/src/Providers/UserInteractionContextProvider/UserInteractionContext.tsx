import { type SsoConnectorMetadata } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

import { type IdentifierInputValue } from '@/components/InputFields/SmartInputField';

export type UserInteractionContextType = {
  // All the enabled sso connectors
  availableSsoConnectorsMap: Map<string, SsoConnectorMetadata>;
  ssoEmail?: string;
  setSsoEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
  // The sso connectors that are enabled for the current domain
  ssoConnectors: SsoConnectorMetadata[];
  setSsoConnectors: React.Dispatch<React.SetStateAction<SsoConnectorMetadata[]>>;
  identifierInputValue?: IdentifierInputValue;
  setIdentifierInputValue: React.Dispatch<React.SetStateAction<IdentifierInputValue | undefined>>;
  forgotPasswordIdentifierInputValue?: IdentifierInputValue;
  setForgotPasswordIdentifierInputValue: React.Dispatch<
    React.SetStateAction<IdentifierInputValue | undefined>
  >;
  /**
   * This method only clear the identifier input values from the session storage.
   *
   * The state of the identifier input values in the `UserInteractionContext` will
   * not be updated.
   *
   * Call this method after the user successfully signs in and before redirecting to
   * the application page to avoid triggering any side effects that depends on the
   * identifier input values.
   */
  clearAllIdentifierInputValuesSilently: () => void;
};

export default createContext<UserInteractionContextType>({
  ssoEmail: undefined,
  availableSsoConnectorsMap: new Map(),
  ssoConnectors: [],
  setSsoEmail: noop,
  setSsoConnectors: noop,
  identifierInputValue: undefined,
  setIdentifierInputValue: noop,
  forgotPasswordIdentifierInputValue: undefined,
  setForgotPasswordIdentifierInputValue: noop,
  clearAllIdentifierInputValuesSilently: noop,
});
