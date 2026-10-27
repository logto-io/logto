import { experience } from '@logto/schemas';
import { useCallback } from 'react';
import { type NavigateOptions } from 'react-router-dom';

import useAbortDirectSignIn from './use-abort-direct-sign-in';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';
import useToast from './use-toast';

type NavigateToSignInOptions = NavigateOptions & {
  /** The error message to show on the hosted sign-in page. */
  readonly toast?: string;
};

/**
 * Returns the terminal fallback navigation for sign-in errors.
 *
 * A failed direct sign-in is finished back at the client that started it: the client owns the
 * sign-in UI, and there is no meaningful hosted page to fall back to. The direct sign-in state is
 * read from the interaction on the server, so a hosted sign-in started later in the same tab keeps
 * the normal fallback. Everything else navigates to the hosted sign-in page as before.
 *
 * `options.toast` is shown only with the hosted fallback, so an aborted direct sign-in does not
 * flash the error before leaving for the client. The navigate options default to
 * `{ replace: true }`; callers that previously pushed the sign-in page pass `{ replace: false }`
 * to keep the current page in the history.
 */
const useNavigateToSignIn = () => {
  const navigate = useNavigateWithPreservedSearchParams();
  const abortDirectSignIn = useAbortDirectSignIn();
  const { setToast } = useToast();

  return useCallback(
    (errorCode?: string, { toast, ...options }: NavigateToSignInOptions = {}) => {
      void (async () => {
        if (await abortDirectSignIn(errorCode)) {
          return;
        }

        if (toast) {
          setToast(toast);
        }

        navigate('/' + experience.routes.signIn, { replace: true, ...options });
      })();
    },
    [abortDirectSignIn, navigate, setToast]
  );
};

export default useNavigateToSignIn;
