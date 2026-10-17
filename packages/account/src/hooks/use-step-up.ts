import { useLogto } from '@logto/react';
import { ExtraParamsKey } from '@logto/schemas';
import { useCallback, useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { isDevFeaturesEnabled } from '@ac/constants/env';
import {
  accountCenterBasePath,
  getUiLocales,
  setRouteRestore,
} from '@ac/utils/account-center-route';
import {
  getStepUpChallenge,
  startPendingStepUp,
  type PendingStepUpAction,
} from '@ac/utils/step-up';

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

type RequestStepUpOptions = {
  /**
   * Whether the failed request already ran with the token set of a completed step-up. Such a
   * request reports the challenge instead of starting another step-up, so a policy the new token
   * still does not meet cannot loop through the authorization endpoint.
   */
  isResumed?: boolean;
};

/**
 * The proof of a recent authentication that a sensitive Account API request carries.
 *
 * With OIDC step-up the access token is the only proof: the request is sent without a legacy
 * verification record, and an RFC 9470 challenge starts a step-up through {@link useStepUp}.
 * Otherwise the request waits for the verification record the legacy verification flow created.
 */
export const useIdentityProof = (): { isReady: boolean; verificationId?: string } => {
  const { verificationId } = useContext(PageContext);

  // DEV: OIDC step-up authentication in Account Center
  if (isDevFeaturesEnabled) {
    return { isReady: true };
  }

  return { isReady: Boolean(verificationId), verificationId };
};

/**
 * Returns `requestStepUp(error, action)`, which starts an OIDC step-up when a failed Account API
 * request carries an RFC 9470 `insufficient_user_authentication` challenge, and resolves to whether
 * it did. The callback resumes `action` on the current route; see `utils/step-up.ts`.
 */
const useStepUp = () => {
  const { signIn } = useLogto();

  return useCallback(
    async (
      error: unknown,
      action: PendingStepUpAction,
      { isResumed = false }: RequestStepUpOptions = {}
    ) => {
      // DEV: OIDC step-up authentication in Account Center
      if (!isDevFeaturesEnabled || isResumed) {
        return false;
      }

      const challenge = getStepUpChallenge(error);

      if (!challenge) {
        return false;
      }

      const route = window.location.pathname;
      const uiLocales = getUiLocales();

      startPendingStepUp(action, route);
      setRouteRestore(route);

      // The current token set stays until the callback replaces it, so an abandoned or failed
      // step-up returns to a signed-in page. `prompt=login` is not requested: the authorization
      // server prompts only when the current session does not satisfy the challenge.
      await signIn({
        redirectUri,
        clearTokens: false,
        extraParams: {
          acr_values: challenge.acrValues,
          max_age: challenge.maxAge,
          ...(uiLocales && { [ExtraParamsKey.UiLocales]: uiLocales }),
        },
      });

      return true;
    },
    [signIn]
  );
};

export default useStepUp;
