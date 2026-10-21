import { useLogto } from '@logto/react';
import { ExtraParamsKey, defaultMaximumAuthenticationAgeInSeconds } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { isDevFeaturesEnabled } from '@ac/constants/env';
import {
  accountCenterBasePath,
  getUiLocales,
  setRouteRestore,
} from '@ac/utils/account-center-route';
import {
  getAccountApiStepUpChallenge,
  getProactiveStepUpChallenge,
  getStepUpChallenge,
  hasFreshFirstFactorAuthentication,
  startPendingStepUp,
  type PendingStepUpAction,
  type StepUpChallenge,
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

export type IdentityProof = {
  /** Whether the current authentication context can authorize sensitive Account API requests. */
  isReady: boolean;
  /** Whether the local ID token is still being inspected for its authentication context. */
  isChecking: boolean;
  /** The legacy verification record. Only present when OIDC step-up is disabled. */
  verificationId?: string;
  /**
   * Re-read the ID token at action time. The page may have stayed open long enough for the
   * context to age out, so the state captured at mount is not enough to decide.
   */
  checkIdentityProof: () => Promise<boolean>;
};

/**
 * The tenant's freshness window from the public authentication policy. Falls back to the default
 * window until the configuration loads, or when it is unavailable: the Account API challenge
 * always corrects a disagreement, so this only affects when Account Center acts proactively.
 */
const useMaximumAuthenticationAgeInSeconds = (): number => {
  const { authenticationPolicy } = useContext(PageContext);

  return (
    authenticationPolicy?.maximumAuthenticationAgeInSeconds ??
    defaultMaximumAuthenticationAgeInSeconds
  );
};

/**
 * The proof of a recent authentication that a sensitive Account API request carries.
 *
 * With OIDC step-up the access token is the only proof: the request is sent without a legacy
 * verification record, and the local ID token's `acr` and `auth_time` tell Account Center whether
 * to call the Account API directly or to start a step-up first. Otherwise the request waits for
 * the verification record the legacy verification flow created.
 */
export const useIdentityProof = (): IdentityProof => {
  const { verificationId } = useContext(PageContext);
  const { getIdTokenClaims } = useLogto();
  const maximumAuthenticationAgeInSeconds = useMaximumAuthenticationAgeInSeconds();
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(isDevFeaturesEnabled);

  const checkIdentityProof = useCallback(async () => {
    if (!isDevFeaturesEnabled) {
      const ready = Boolean(verificationId);
      setIsReady(ready);
      setIsChecking(false);
      return ready;
    }

    setIsChecking(true);

    try {
      const claims = await getIdTokenClaims();
      const ready = hasFreshFirstFactorAuthentication(claims, maximumAuthenticationAgeInSeconds);
      setIsReady(ready);
      return ready;
    } catch {
      setIsReady(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [getIdTokenClaims, maximumAuthenticationAgeInSeconds, verificationId]);

  useEffect(() => {
    void checkIdentityProof();
  }, [checkIdentityProof]);

  if (!isDevFeaturesEnabled) {
    return {
      isReady: Boolean(verificationId),
      isChecking: false,
      verificationId,
      checkIdentityProof,
    };
  }

  return { isReady, isChecking, checkIdentityProof };
};

type StepUpController = {
  /**
   * Start a step-up when a failed Account API request carries an RFC 9470
   * `insufficient_user_authentication` challenge. Resolves to whether it did.
   */
  requestStepUp: (
    error: unknown,
    action: PendingStepUpAction,
    options?: RequestStepUpOptions
  ) => Promise<boolean>;
  /**
   * Start a step-up before a sensitive request, because the local ID token does not carry a fresh
   * first-factor context. Resolves to whether it did.
   */
  startStepUp: (action: PendingStepUpAction) => Promise<boolean>;
};

/**
 * Starts an OIDC step-up and resumes `action` on the current route; see `utils/step-up.ts`.
 * {@link StepUpController.requestStepUp} handles the RFC 9470 challenge of a request that was
 * already sent, while {@link StepUpController.startStepUp} avoids sending a request that is known
 * to be challenged.
 */
const useStepUp = (): StepUpController => {
  const { signIn } = useLogto();
  const maximumAuthenticationAgeInSeconds = useMaximumAuthenticationAgeInSeconds();

  const beginStepUp = useCallback(
    async (action: PendingStepUpAction, { acrValues, maxAge }: StepUpChallenge) => {
      const route = window.location.pathname;
      const uiLocales = getUiLocales();

      startPendingStepUp(action, route);
      setRouteRestore(route);

      // The current token set stays until the callback replaces it, so an abandoned or failed
      // step-up returns to a signed-in page. `prompt=login` is not requested: the authorization
      // server prompts only when the current session does not satisfy the request.
      await signIn({
        redirectUri,
        clearTokens: false,
        extraParams: {
          acr_values: acrValues,
          max_age: maxAge,
          ...(uiLocales && { [ExtraParamsKey.UiLocales]: uiLocales }),
        },
      });
    },
    [signIn]
  );

  const requestStepUp = useCallback(
    async (
      error: unknown,
      action: PendingStepUpAction,
      { isResumed = false }: RequestStepUpOptions = {}
    ) => {
      // DEV: OIDC step-up authentication in Account Center
      if (!isDevFeaturesEnabled || isResumed) {
        return false;
      }

      // A challenge parameter the server sent wins; the tenant policy only fills in a missing one.
      const challenge = getStepUpChallenge(
        error,
        getAccountApiStepUpChallenge(maximumAuthenticationAgeInSeconds)
      );

      if (!challenge) {
        return false;
      }

      await beginStepUp(action, challenge);

      return true;
    },
    [beginStepUp, maximumAuthenticationAgeInSeconds]
  );

  const startStepUp = useCallback(
    async (action: PendingStepUpAction) => {
      // DEV: OIDC step-up authentication in Account Center
      if (!isDevFeaturesEnabled) {
        return false;
      }

      await beginStepUp(action, getProactiveStepUpChallenge(maximumAuthenticationAgeInSeconds));

      return true;
    },
    [beginStepUp, maximumAuthenticationAgeInSeconds]
  );

  return { requestStepUp, startStepUp };
};

export default useStepUp;
