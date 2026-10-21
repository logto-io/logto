import { useLogto } from '@logto/react';
import { ExtraParamsKey } from '@logto/schemas';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  accountCenterBasePath,
  getUiLocales,
  setRouteRestore,
} from '@ac/utils/account-center-route';
import {
  consumePendingStepUpAction,
  getStepUpChallenge,
  hasFreshFirstFactorAuthentication,
  proactiveStepUpChallenge,
  startPendingStepUp,
  subpageAuthenticationMaxAgeSeconds,
  subpageStepUpChallenge,
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
  /**
   * The Account Center route to return to, when it differs from the current page. A callback page
   * returns to the subpage that started the flow, for example.
   */
  route?: string;
};

export type IdentityProof = {
  /** Whether the current authentication context can authorize sensitive Account API requests. */
  isReady: boolean;
  /** Whether the local ID token is still being inspected for its authentication context. */
  isChecking: boolean;
  /**
   * Re-read the ID token at action time. The page may have stayed open long enough for the
   * context to age out, so the state captured at mount is not enough to decide.
   */
  checkIdentityProof: () => Promise<boolean>;
};

/**
 * The proof of a recent authentication that a sensitive Account API request carries: the access
 * token is the only proof. The local ID token's `acr` and `auth_time` tell Account Center whether
 * to call the Account API directly or to start a step-up first.
 */
export const useIdentityProof = (): IdentityProof => {
  const { getIdTokenClaims } = useLogto();
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkIdentityProof = useCallback(async () => {
    setIsChecking(true);

    try {
      const claims = await getIdTokenClaims();
      const ready = hasFreshFirstFactorAuthentication(claims);
      setIsReady(ready);
      return ready;
    } catch {
      setIsReady(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [getIdTokenClaims]);

  useEffect(() => {
    void checkIdentityProof();
  }, [checkIdentityProof]);

  return { isReady, isChecking, checkIdentityProof };
};

type StepUpEntryState = {
  /** Whether the page may render its form and run its Account API calls. */
  isReady: boolean;
  /** Whether the local ID token is still being inspected. */
  isChecking: boolean;
  /**
   * Whether a step-up just completed but the new context is still not fresh enough. Retrying
   * would loop through the authorization endpoint, so the page reports the failure instead.
   */
  hasFailed: boolean;
};

type StepUpEntryOptions = {
  /** Whether the page is enabled for this user; a disabled page must not start a step-up. */
  enabled: boolean;
  /** Skip the entry check for a flow that is allowed without verification. */
  skip?: boolean;
};

/**
 * Guard the entry of a standalone Account Center subpage. Sensitive multi-step flows must not let
 * the user fill a form, receive an OTP, scan a TOTP QR code, register a WebAuthn credential, or
 * finish an upstream OAuth only to have the final write rejected.
 *
 * When the ID token lacks a fresh `1fa` context, the hook renders through `isChecking` and starts
 * an OIDC step-up with `max_age` equal to the entry threshold. The route is restored on callback.
 */
export const useStepUpEntry = ({ enabled, skip = false }: StepUpEntryOptions): StepUpEntryState => {
  const { getIdTokenClaims } = useLogto();
  const { startStepUp } = useStepUp();
  const [state, setState] = useState<StepUpEntryState>(() => ({
    isReady: skip,
    isChecking: enabled && !skip,
    hasFailed: false,
  }));
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setState({ isReady: false, isChecking: false, hasFailed: false });
      return;
    }

    if (skip) {
      setState({ isReady: true, isChecking: false, hasFailed: false });
      return;
    }

    if (hasStartedRef.current) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    hasStartedRef.current = true;
    // eslint-disable-next-line @silverhand/fp/no-let -- the effect cleanup flips this flag
    let isCancelled = false;

    const check = async () => {
      setState((current) => ({ ...current, isChecking: true }));

      // Consume an entry step-up on the page it restored, so a later subpage cannot mistake it
      // for a step-up of its own. It only matters when the new context is still not fresh.
      const justSteppedUp = Boolean(consumePendingStepUpAction(['enter-subpage']));

      try {
        const claims = await getIdTokenClaims();
        const ready = hasFreshFirstFactorAuthentication(
          claims,
          Date.now(),
          subpageAuthenticationMaxAgeSeconds
        );

        if (isCancelled) {
          return;
        }

        if (ready) {
          setState({ isReady: true, isChecking: false, hasFailed: false });
          return;
        }

        // A step-up that just completed on this route did not refresh the context far enough.
        // Starting another one would loop through the authorization endpoint.
        if (justSteppedUp) {
          setState({ isReady: false, isChecking: false, hasFailed: true });
          return;
        }

        await startStepUp({ type: 'enter-subpage' }, subpageStepUpChallenge);
      } catch {
        if (!isCancelled) {
          setState({ isReady: false, isChecking: false, hasFailed: true });
        }
      }
    };

    void check();

    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isCancelled = true;
      // Allow a rerun when a dependency changes while the check is in flight. Without this, the
      // cancelled check would leave the page loading forever.
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasStartedRef.current = false;
    };
  }, [enabled, getIdTokenClaims, skip, startStepUp]);

  return state;
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
  startStepUp: (action: PendingStepUpAction, challenge?: StepUpChallenge) => Promise<boolean>;
};

/**
 * Starts an OIDC step-up and resumes `action` on the current route; see `utils/step-up.ts`.
 * {@link StepUpController.requestStepUp} handles the RFC 9470 challenge of a request that was
 * already sent, while {@link StepUpController.startStepUp} avoids sending a request that is known
 * to be challenged.
 */
const useStepUp = (): StepUpController => {
  const { signIn } = useLogto();

  const beginStepUp = useCallback(
    async (
      action: PendingStepUpAction,
      { acrValues, maxAge }: StepUpChallenge,
      routeOverride?: string
    ) => {
      const route = routeOverride ?? window.location.pathname;
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
      { isResumed = false, route }: RequestStepUpOptions = {}
    ) => {
      if (isResumed) {
        return false;
      }

      const challenge = getStepUpChallenge(error);

      if (!challenge) {
        return false;
      }

      await beginStepUp(action, challenge, route);

      return true;
    },
    [beginStepUp]
  );

  const startStepUp = useCallback(
    async (action: PendingStepUpAction, challenge: StepUpChallenge = proactiveStepUpChallenge) => {
      await beginStepUp(action, challenge);

      return true;
    },
    [beginStepUp]
  );

  return { requestStepUp, startStepUp };
};

export default useStepUp;
