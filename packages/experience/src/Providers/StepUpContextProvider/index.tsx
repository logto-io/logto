import { type LogtoErrorCode } from '@logto/phrases';
import { type InteractionAuthenticationContext, type RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useMatch } from 'react-router-dom';

import { getStepUpContext, initStepUp } from '@/apis/experience';
import { stepUpRoutes, stepUpSessionGoneErrorCodes } from '@/constants/step-up';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';

import StepUpContext, { type StepUpContextType } from './StepUpContext';

type Props = {
  readonly children: ReactNode;
};

/** The interaction storage holds nothing for this interaction yet, so it has to be created. */
const interactionNotFoundCode: LogtoErrorCode = 'session.interaction_not_found';

const sessionGoneErrorCodes: ReadonlySet<string> = new Set(stepUpSessionGoneErrorCodes);

/** Read the Logto error code from a failed request without consuming the response body. */
const getErrorCode = async (error: unknown): Promise<string | undefined> => {
  if (!(error instanceof HTTPError)) {
    return;
  }

  try {
    const { code } = await error.response.clone().json<RequestErrorBody>();

    return code;
  } catch {
    // A response without a JSON body carries no Logto error code.
  }
};

/**
 * Loads the server-driven step-up state for the `/step-up` route tree and exposes it through
 * {@link StepUpContext}.
 *
 * Interaction storage is the single source of state, so the provider never reads flow state from
 * `location.state`:
 *
 * - Every arrival at the landing page re-reads the context, and creates the interaction with
 *   `PUT /experience { interactionEvent: SignIn }` only when storage holds nothing for it yet. A
 *   refresh, or a return to the method list after a rejected submission, therefore keeps the
 *   proofs the interaction already recorded instead of starting over.
 * - A child route reads the context once when it mounts, so a refresh recovers the same state.
 * - When the interaction cannot proceed, `PUT /experience` answers `200 { redirectTo }` and the
 *   client is sent back to the application with `window.location.replace()`.
 */
const StepUpContextProvider = ({ children }: Props) => {
  const [authenticationContext, setAuthenticationContext] =
    useState<InteractionAuthenticationContext>();
  const [isFetching, setIsFetching] = useState(true);
  const [loadedLandingKey, setLoadedLandingKey] = useState<string>();
  const handledLandingKeyRef = useRef<string>();
  const hasLoadedRef = useRef(false);
  /** The id of the latest load; an older load that settles later must not overwrite it. */
  const loadIdRef = useRef(0);

  const asyncGetStepUpContext = useApi(getStepUpContext);
  const asyncInitStepUp = useApi(initStepUp);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const { key } = useLocation();
  const isLanding = Boolean(useMatch(stepUpRoutes.landing));
  // The location key identifies one arrival at the landing page, so each arrival loads once.
  const landingKey = isLanding ? key : undefined;

  /** A session that is gone lands on the invalid-session page silently; anything else also toasts. */
  const reportError = useCallback(
    async (error: unknown) => {
      const code = await getErrorCode(error);

      if (!code || !sessionGoneErrorCodes.has(code)) {
        await handleError(error);
      }
    },
    [handleError]
  );

  /**
   * Load the context, creating the interaction first when asked and storage holds nothing for
   * it. Resolves with whether this load was still the latest one when it settled: a load that a
   * newer one superseded writes nothing, so the state always reflects the latest arrival.
   */
  const load = useCallback(
    async (shouldInitialize: boolean): Promise<boolean> => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasLoadedRef.current = true;
      // eslint-disable-next-line @silverhand/fp/no-mutation
      loadIdRef.current += 1;
      const loadId = loadIdRef.current;
      const isCurrent = () => loadIdRef.current === loadId;
      const settle = (context?: InteractionAuthenticationContext) => {
        if (isCurrent()) {
          setAuthenticationContext(context);
          setIsFetching(false);
        }

        return isCurrent();
      };
      const fail = async (error: unknown) => {
        await reportError(error);

        return settle(undefined);
      };

      setIsFetching(true);

      const [error, context] = await asyncGetStepUpContext();

      if (!error) {
        return settle(context);
      }

      if (!shouldInitialize || (await getErrorCode(error)) !== interactionNotFoundCode) {
        return fail(error);
      }

      const [initError, result] = await asyncInitStepUp();

      if (initError) {
        return fail(initError);
      }

      if (result?.redirectTo) {
        // The interaction was finished with `unmet_authentication_requirements`; the application
        // explains it. The redirect unloads the page, so this never resolves.
        await redirectTo(result.redirectTo);

        return false;
      }

      const [contextError, initializedContext] = await asyncGetStepUpContext();

      if (contextError) {
        return fail(contextError);
      }

      return settle(initializedContext);
    },
    [asyncGetStepUpContext, asyncInitStepUp, redirectTo, reportError]
  );

  const refetch = useCallback(async () => {
    await load(false);
  }, [load]);

  useEffect(() => {
    if (landingKey === undefined) {
      if (!hasLoadedRef.current) {
        void load(false);
      }

      return;
    }

    if (handledLandingKeyRef.current === landingKey) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    handledLandingKeyRef.current = landingKey;

    const loadLanding = async () => {
      if (await load(true)) {
        setLoadedLandingKey(landingKey);
      }
    };

    void loadLanding();
  }, [landingKey, load]);

  const stepUpContext = useMemo<StepUpContextType>(
    () => ({
      authenticationContext,
      // A new arrival at the landing page is loading from its first render, before the effect
      // runs, so the landing page never dispatches on the context of a previous visit.
      isLoading: isFetching || (landingKey !== undefined && loadedLandingKey !== landingKey),
      refetch,
    }),
    [authenticationContext, isFetching, landingKey, loadedLandingKey, refetch]
  );

  return <StepUpContext.Provider value={stepUpContext}>{children}</StepUpContext.Provider>;
};

export default StepUpContextProvider;
