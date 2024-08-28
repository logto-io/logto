import { noop } from '@react-spring/shared';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';

type Options = {
  /**
   * Whether to clear the interaction context session storage before redirecting.
   * Defaults to `true`.
   * Set to `false` if this redirection is not the final redirection in the sign-in process (not the sign-in successful redirection).
   */
  shouldClearInteractionContextSession?: boolean;
  /**
   * Whether to use `window.location.replace` instead of `window.location.assign` for the redirection.
   * Defaults to `true`.
   * Use `false` if this is a 3rd-party URL redirection (social sign-in or single sign-on redirection) that should be added to the browser history.
   */
  isReplace?: boolean;
};

/**
 * Hook for global redirection to 3rd-party URLs (e.g., social sign-in, single sign-on, and the final redirection to the
 * app redirect URI after successful sign-in).
 *
 * This hook provides an async function that represents the final step in the login process.
 * It sets a global loading state, clears the interaction context (if needed), and then redirects the user.
 *
 * The returned async function will never resolve, as the page will be redirected before
 * the Promise can settle. This behavior is intentional and serves to maintain the loading
 * state on the interaction element (e.g., a button) that triggered the successful login.
 */
function useGlobalRedirectTo({
  shouldClearInteractionContextSession = true,
  isReplace = true,
}: Options = {}) {
  const { setLoading } = useContext(PageContext);
  const { clearInteractionContextSessionStorage } = useContext(UserInteractionContext);

  const redirectTo = useCallback(
    async (url: string | URL): Promise<never> => {
      /**
       * Set global loading state to true
       * This prevents further user interaction during the redirect process
       */
      setLoading(true);
      /**
       * Clear all identifier input values from the storage once the interaction is submitted.
       * The Identifier cache should be session-isolated, so it should be cleared after the interaction is completed.
       */
      if (shouldClearInteractionContextSession) {
        clearInteractionContextSessionStorage();
      }
      /**
       * Perform the actual redirect
       * This is a synchronous operation and will immediately unload the current page
       */
      if (isReplace) {
        window.location.replace(url);
      } else {
        window.location.assign(url);
      }

      /**
       * Return a Promise that never resolves
       * This ensures that any async function awaiting this redirect will never continue
       * Thus maintaining the loading state on the UI until the new page is loaded
       */
      return new Promise<never>(noop);
    },
    [
      clearInteractionContextSessionStorage,
      isReplace,
      setLoading,
      shouldClearInteractionContextSession,
    ]
  );

  return redirectTo;
}

export default useGlobalRedirectTo;
