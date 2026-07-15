import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import { persistentErrorMessageStateGuard } from '@/types/guard';

/**
 * Reads a persistent error message passed via the router navigation state.
 *
 * E.g. the enterprise SSO callback page redirects back to the sign-in page with the error
 * message in the navigation state when the identified user is suspended, so the sign-in
 * form can keep displaying the error after the global toast auto-dismisses.
 *
 * The error message is kept in local state so the form can clear it following its own
 * error-clearing rules (e.g. on resubmission or when the inputs become invalid).
 */
const useLocationErrorMessage = () => {
  const { state } = useLocation();

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    is(state, persistentErrorMessageStateGuard) ? state.errorMessage : undefined
  );

  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  return { errorMessage, clearErrorMessage };
};

export default useLocationErrorMessage;
