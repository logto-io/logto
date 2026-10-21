import { useCallback } from 'react';

import { abortInteraction, getDirectSignIn } from '@/apis/experience';
import { isDevFeaturesEnabled } from '@/constants/env';

import useApi from './use-api';
import useGlobalRedirectTo from './use-global-redirect-to';

/**
 * Returns a function that finishes a failed direct sign-in back at the client.
 *
 * The direct sign-in state is read from the current interaction on the server, so it is scoped to
 * that interaction: a hosted sign-in started later in the same tab is not affected. Resolves
 * `true` when the interaction was aborted and the user agent is leaving for the client, and
 * `false` when the caller should run its regular fallback.
 */
const useAbortDirectSignIn = () => {
  const asyncGetDirectSignIn = useApi(getDirectSignIn);
  const asyncAbortInteraction = useApi(abortInteraction);
  const redirectTo = useGlobalRedirectTo();

  return useCallback(
    async (reason?: string) => {
      if (!isDevFeaturesEnabled) {
        // DEV: Direct sign-in abort.
        return false;
      }

      const [error, result] = await asyncGetDirectSignIn();

      if (error || !result?.directSignIn) {
        return false;
      }

      const [, abortResult] = await asyncAbortInteraction(reason);

      if (!abortResult?.redirectTo) {
        return false;
      }

      await redirectTo(abortResult.redirectTo);

      return true;
    },
    [asyncAbortInteraction, asyncGetDirectSignIn, redirectTo]
  );
};

export default useAbortDirectSignIn;
