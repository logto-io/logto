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
  /**
   * The cached identifier input value that the user has inputted when signing in.
   * The value will be used to pre-fill the identifier input field in sign-in pages.
   */
  identifierInputValue?: IdentifierInputValue;
  /**
   * This method is used to cache the identifier input value when signing in.
   */
  setIdentifierInputValue: React.Dispatch<React.SetStateAction<IdentifierInputValue | undefined>>;
  /**
   * The cached identifier input value that used in the 'ForgotPassword' flow.
   * The value will be used to pre-fill the identifier input field in the `ForgotPassword` page.
   */
  forgotPasswordIdentifierInputValue?: IdentifierInputValue;
  /**
   * This method is used to cache the identifier input values for the 'ForgotPassword' flow.
   */
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
  clearInteractionContextSessionStorage: () => void;
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
  clearInteractionContextSessionStorage: noop,
});
