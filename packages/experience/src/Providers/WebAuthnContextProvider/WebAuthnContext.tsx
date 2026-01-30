import { type WebAuthnAuthenticationOptions } from '@logto/schemas';
import { createContext } from 'react';

export type WebAuthnAuthenticationOptionsResult = {
  options: WebAuthnAuthenticationOptions;
  verificationId: string;
};

export type WebAuthnContextType = {
  authenticationOptionsResult: WebAuthnAuthenticationOptionsResult | undefined;
  isLoading: boolean;
};

/**
 * This context is used to share the WebAuthn authentication options across the page and form components.
 */
const WebAuthnContext = createContext<WebAuthnContextType>({
  authenticationOptionsResult: undefined,
  isLoading: false,
});

export default WebAuthnContext;
