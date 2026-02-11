import { type WebAuthnAuthenticationOptions } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

export type WebAuthnContextType = {
  authenticationOptions: WebAuthnAuthenticationOptions | undefined;
  isLoading: boolean;
  /**
   * Mark the current authentication options as consumed, and immediately fetch new options data.
   */
  markAuthenticationOptionsConsumed: () => void;
  /**
   * Abort any pending conditional UI WebAuthn request.
   * This must be called before starting a new `navigator.credentials.get()` request
   * to avoid `OperationError: A request is already pending`.
   */
  abortConditionalUI: () => void;
  /**
   * Register a new AbortController for the conditional UI request so that
   * it can be aborted externally (e.g. when the user clicks "Continue with passkey").
   */
  setConditionalUIAbortController: (controller: AbortController | undefined) => void;
};

/**
 * This context is used to share the WebAuthn authentication options across the page and form components.
 */
const WebAuthnContext = createContext<WebAuthnContextType>({
  authenticationOptions: undefined,
  isLoading: false,
  markAuthenticationOptionsConsumed: noop,
  abortConditionalUI: noop,
  setConditionalUIAbortController: noop,
});

export default WebAuthnContext;
