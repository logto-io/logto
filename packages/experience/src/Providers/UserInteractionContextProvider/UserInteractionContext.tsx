import { type SsoConnectorMetadata } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

import {
  type IdentifierInputType,
  type IdentifierInputValue,
} from '@/components/InputFields/SmartInputField';

export type UserInteractionContextType = {
  // All the enabled sso connectors
  availableSsoConnectorsMap: Map<string, SsoConnectorMetadata>;
  ssoEmail?: string;
  setSsoEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
  // The sso connectors that are enabled for the current domain
  ssoConnectors: SsoConnectorMetadata[];
  setSsoConnectors: React.Dispatch<React.SetStateAction<SsoConnectorMetadata[]>>;
  /**
   * Retrieves the cached identifier input value that the user has inputted when signing in based on enabled types.
   * The value will be used to pre-fill the identifier input field in sign-in pages.
   *
   * @param {IdentifierInputType[] | undefined} enabledTypes - Array of enabled identifier types
   * @returns {IdentifierInputValue | undefined} The identifier input value object or undefined
   *
   * Usage:
   * 1. If enabledTypes is not provided, the function returns the full identifierInputValue without filtering
   * 2. If enabledTypes is provided, the function checks if the type of identifierInputValue is in the enabledTypes array
   * 3. If the type matches, it returns identifierInputValue; otherwise, it returns undefined
   *
   * Example:
   * const value = getIdentifierInputValue(['email', 'phone']);
   * // Returns identifierInputValue if its type is 'email' or 'phone'
   * // Returns undefined otherwise
   */
  getIdentifierInputValue: (
    enabledTypes?: IdentifierInputType[]
  ) => IdentifierInputValue | undefined;
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
  // eslint-disable-next-line unicorn/no-useless-undefined
  getIdentifierInputValue: () => undefined,
  setIdentifierInputValue: noop,
  forgotPasswordIdentifierInputValue: undefined,
  setForgotPasswordIdentifierInputValue: noop,
  clearInteractionContextSessionStorage: noop,
});
