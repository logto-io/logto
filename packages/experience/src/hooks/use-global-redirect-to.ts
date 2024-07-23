import { noop } from '@react-spring/shared';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';

/**
 * Hook for global redirection after successful login.
 *
 * This hook provides an async function that represents the final step in the login process.
 * It sets a global loading state, clears the interaction context, and then redirects the user.
 *
 * The returned async function will never resolve, as the page will be redirected before
 * the Promise can settle. This behavior is intentional and serves to maintain the loading
 * state on the interaction element (e.g., a button) that triggered the successful login.
 */
function useGlobalRedirectTo() {
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
      clearInteractionContextSessionStorage();
      /**
       * Perform the actual redirect
       * This is a synchronous operation and will immediately unload the current page
       */
      window.location.replace(url);

      /**
       * Return a Promise that never resolves
       * This ensures that any async function awaiting this redirect will never continue
       * Thus maintaining the loading state on the UI until the new page is loaded
       */
      return new Promise<never>(noop);
    },
    [clearInteractionContextSessionStorage, setLoading]
  );

  return redirectTo;
}

export default useGlobalRedirectTo;
