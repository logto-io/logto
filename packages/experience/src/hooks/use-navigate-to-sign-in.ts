import { experience } from '@logto/schemas';
import { useCallback } from 'react';

import useAbortDirectSignIn from './use-abort-direct-sign-in';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';

/**
 * Returns the terminal fallback navigation for sign-in errors.
 *
 * A failed direct sign-in is finished back at the client that started it: the client owns the
 * sign-in UI, and there is no meaningful hosted page to fall back to. The direct sign-in state is
 * read from the interaction on the server, so a hosted sign-in started later in the same tab keeps
 * the normal fallback. Everything else navigates to the hosted sign-in page as before.
 */
const useNavigateToSignIn = () => {
  const navigate = useNavigateWithPreservedSearchParams();
  const abortDirectSignIn = useAbortDirectSignIn();

  return useCallback(
    (errorCode?: string) => {
      void (async () => {
        if (await abortDirectSignIn(errorCode)) {
          return;
        }

        navigate('/' + experience.routes.signIn, { replace: true });
      })();
    },
    [abortDirectSignIn, navigate]
  );
};

export default useNavigateToSignIn;
