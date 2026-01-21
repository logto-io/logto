import { type WebAuthnAuthenticationOptions } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

export type WebAuthnContextType = {
  authenticationOptions: WebAuthnAuthenticationOptions | undefined;
  isLoading: boolean;
  markAuthenticationOptionsConsumed: () => void;
};

/**
 * This context is used to share the WebAuthn authentication options across the page and form components.
 */
const WebAuthnContext = createContext<WebAuthnContextType>({
  authenticationOptions: undefined,
  isLoading: false,
  markAuthenticationOptionsConsumed: noop,
});

export default WebAuthnContext;
