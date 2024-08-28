import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

/**
 * This hook provides a function that process the app redirection after user successfully signs in.
 * Use window.location.replace to handle the redirection.
 * Set the global loading state to true before redirecting.
 * This is to prevent the user from interacting with the app while the redirection is in progress.
 */

function useGlobalRedirectTo() {
  const { setLoading } = useContext(PageContext);

  const redirectTo = useCallback(
    (url: string | URL) => {
      setLoading(true);
      window.location.replace(url);
    },
    [setLoading]
  );

  return redirectTo;
}

export default useGlobalRedirectTo;
