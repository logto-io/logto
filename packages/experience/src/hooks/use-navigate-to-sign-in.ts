import { experience } from '@logto/schemas';
import { useCallback } from 'react';

import { abortInteraction } from '@/apis/experience';

import useApi from './use-api';
import useGlobalRedirectTo from './use-global-redirect-to';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';
import useSessionStorage, { StorageKeys } from './use-session-storages';

/**
 * Returns the terminal fallback navigation for sign-in errors.
 *
 * A session that entered through direct sign-in has no meaningful hosted sign-in page to fall
 * back to — the client application owns the sign-in UI. For those sessions, finish the
 * interaction with an OAuth `access_denied` error so the user returns to the client that
 * initiated it; fall back to the hosted sign-in page only when aborting fails (e.g. the
 * interaction has expired). Sessions that entered through the hosted pages keep the original
 * fallback behavior.
 *
 * The direct sign-in marker is consumed on use: after one abort attempt the user either left
 * for the client or landed on the hosted sign-in page, and later errors in the same tab should
 * fall back normally.
 */
const useNavigateToSignIn = () => {
  const navigate = useNavigateWithPreservedSearchParams();
  const asyncAbortInteraction = useApi(abortInteraction);
  const redirectTo = useGlobalRedirectTo();
  const { get, remove } = useSessionStorage();

  return useCallback(
    (errorCode?: string) => {
      void (async () => {
        if (get(StorageKeys.DirectSignIn)) {
          remove(StorageKeys.DirectSignIn);

          const [, result] = await asyncAbortInteraction(errorCode);

          if (result?.redirectTo) {
            await redirectTo(result.redirectTo);
            return;
          }
        }

        navigate('/' + experience.routes.signIn, { replace: true });
      })();
    },
    [asyncAbortInteraction, get, navigate, redirectTo, remove]
  );
};

export default useNavigateToSignIn;
