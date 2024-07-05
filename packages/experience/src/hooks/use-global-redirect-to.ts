import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';

/**
 * This hook provides a function that process the app redirection after user successfully signs in.
 * Use window.location.replace to handle the redirection.
 * Set the global loading state to true before redirecting.
 * Clear the user identifier user input value from session storage before redirecting.
 * This is to prevent the user from interacting with the app while the redirection is in progress.
 */
function useGlobalRedirectTo() {
  const { setLoading } = useContext(PageContext);
  const { clearInteractionContextSessionStorage } = useContext(UserInteractionContext);

  const redirectTo = useCallback(
    (url: string | URL) => {
      setLoading(true);
      /**
       * Clear all identifier input values silently otherwise pages relying on the identifier input values
       * will render an error page before the redirection.
       */
      clearInteractionContextSessionStorage();
      window.location.replace(url);
    },
    [clearInteractionContextSessionStorage, setLoading]
  );

  return redirectTo;
}

export default useGlobalRedirectTo;
