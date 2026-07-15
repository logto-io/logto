import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { object, optional, string, validate } from 'superstruct';

import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';

const errorMessageStateGuard = object({
  errorMessage: optional(string()),
});

/**
 * Reads a one-shot `errorMessage` from the current location state (e.g. after an SSO
 * callback redirects back to the sign-in form) and clears it from history so it is not
 * replayed on refresh or back navigation.
 */
const useLocationErrorMessage = () => {
  const { state, pathname, search } = useLocation();
  const navigate = useNavigateWithPreservedSearchParams();
  const [, parsed] = validate(state, errorMessageStateGuard);
  const [errorMessage, setErrorMessage] = useState(parsed?.errorMessage);

  useEffect(() => {
    if (!parsed?.errorMessage) {
      return;
    }

    // Clear the consumed state while keeping the user on the same URL.
    navigate({ pathname, search }, { replace: true, state: null });
    // Only consume location state once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  return {
    errorMessage,
    clearErrorMessage,
  };
};

export default useLocationErrorMessage;
